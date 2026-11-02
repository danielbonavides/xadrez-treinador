/* HOF-XWEB-1.2-STOCKFISH240-v1.0 — isolated, read-only experimental evidence adapter.
   NEVER writes DATA, attempts, scoring, localStorage or adaptive review state. */
(function(root, factory) {
  const adapter = factory();
  if (typeof module === 'object' && module.exports) module.exports = adapter;
  if (root) root.XadrezEvidence = adapter;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const ROOT_SCHEMA = 'xadrez.pedagogia.catalogo.experimental.v1.3';
  const ITEM_SCHEMA = 'xadrez.pedagogia.v1.3';
  const KINDS = ['multipv_top_1','multipv_top_2','human_forced','g5_forced'];
  const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
  const ID = /^EX\d{4}$/;
  const PRIVATE_KEY = /(?:chess.?com|username|opponent|player.?name|game.?id|url|pgn|email|account|token|private|adversar|partida.?id)/i;
  const EXTRA_KEYS = {
    root: ['schema_version','status','source_sha256','puzzles'],
    item: ['candidate','exercise_id','guidance','lines','motifs','position','quality','schema_version','verification'],
    candidate: ['status','suggested_uci_g5'],
    position: ['fen_before','ply','side_to_move'],
    quality: ['diagnostic_certified','engine_verified','legal_moves_verified','privacy_review'],
    verification: ['depth_requested','engine','multipv_requested','policy_version','status'],
    line: ['depth_reached','kind','mate_in_pov_player','nodes','pv_uci','root_uci','score_cp_pov_player'],
    guidance: ['explanation','hint_1','hint_2','status']
  };
  const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
  function shape(obj, name) {
    if (!isObj(obj)) return false;
    return Object.keys(obj).every(k => EXTRA_KEYS[name].includes(k) && !PRIVATE_KEY.test(k));
  }
  function privacy(item) {
    if (!shape(item,'item') || !shape(item.candidate,'candidate') || !shape(item.position,'position') ||
        !shape(item.quality,'quality') || !shape(item.verification,'verification') || !shape(item.guidance,'guidance')) return false;
    if (!Array.isArray(item.lines) || !item.lines.every(x => shape(x,'line'))) return false;
    if (!Array.isArray(item.motifs) || !item.motifs.every(x=>typeof x==='string' && x.length<150)) return false;
    const raw=JSON.stringify(item);
    return !/https?:\/\/|www\.|chess\.com|\b[A-Za-z0-9_.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\b\d{10,}\b/i.test(raw);
  }
  function verifyPv(fen, line, rules) {
    if (!shape(line,'line') || !KINDS.includes(line.kind) || !UCI.test(line.root_uci) ||
        !Array.isArray(line.pv_uci) || !line.pv_uci.length || line.pv_uci[0]!==line.root_uci ||
        !Number.isInteger(line.depth_reached) || line.depth_reached<=0) return false;
    const cp=line.score_cp_pov_player, mate=line.mate_in_pov_player;
    if ((cp===null)===(mate===null) || (cp!==null && !Number.isInteger(cp)) ||
        (mate!==null && (!Number.isInteger(mate) || mate===0))) return false;
    let state;
    try { state=rules.parse(fen); } catch (_) { return false; }
    for (const uci of line.pv_uci) {
      if (typeof uci!=='string' || !UCI.test(uci)) return false;
      const move=rules.legal(state).find(m => rules.uci(m)===uci);
      if (!move) return false;
      state=rules.apply(state,move);
    }
    return true;
  }
  function normalizeItem(e,p,rules) {
    if (!privacy(e)) throw Error('PRIVACIDADE_OU_SCHEMA');
    if (e.schema_version!==ITEM_SCHEMA) throw Error('SCHEMA_ITEM');
    if (!ID.test(e.exercise_id) || e.exercise_id!==p.id) throw Error('ID');
    if (e.position.fen_before!==p.fen || e.position.ply!==p.ply ||
        e.position.side_to_move!==p.fen.split(' ')[1]) throw Error('FEN_PLY');
    if (e.candidate.suggested_uci_g5!==p.melhor_uci || !UCI.test(e.candidate.suggested_uci_g5)) throw Error('G5');
    if (e.quality.privacy_review!==true || e.quality.engine_verified!==true ||
        e.quality.legal_moves_verified!==true || e.quality.diagnostic_certified!==false ||
        e.verification.status!=='ENGINE_EVIDENCE_RESEARCH_NOT_DIAGNOSIS' ||
        e.verification.engine!=='Stockfish 19' || e.verification.depth_requested!==10 ||
        e.verification.multipv_requested!==2) throw Error('NAO_CERTIFICADO_OU_PROVENIENCIA');
    if (!Array.isArray(e.lines) || e.lines.length!==4 || new Set(e.lines.map(x=>x.kind)).size!==4 ||
        !KINDS.every(k=>e.lines.some(x=>x.kind===k))) throw Error('LINHAS');
    if (!e.lines.every(line=>verifyPv(p.fen,line,rules))) throw Error('PV_SCORE_PERSPECTIVA');
    const lines=Object.fromEntries(e.lines.map(line=>[line.kind,{
      root_uci:line.root_uci, pv_uci:line.pv_uci.slice(),
      depth:line.depth_reached, cp:line.score_cp_pov_player, mate:line.mate_in_pov_player
    }]));
    if (lines.g5_forced.root_uci!==p.melhor_uci ||
        (p.uci_jogado && lines.human_forced.root_uci!==p.uci_jogado)) throw Error('RAIZES_FORCADAS');
    return Object.freeze({id:p.id, g5:p.melhor_uci,
      different: lines.multipv_top_1.root_uci!==p.melhor_uci,
      lines, engine:'Stockfish 19', depth:10, certified:false,
      hint:String(e.guidance.hint_1||'').slice(0,180),
      explanation:String(e.guidance.explanation||'').slice(0,220)
    });
  }
  function normalizeCatalog(catalog,puzzles,rules,options) {
    const byId=new Map(), errors=new Map();
    const stats={total:puzzles.length,valid:0,unavailable:0,divergences:0,globalError:null};
    const strict=!(options && options.allowSubset);
    if (!shape(catalog,'root') || catalog.schema_version!==ROOT_SCHEMA ||
        catalog.status!=='ISOLADO_NAO_PUBLICADO' || !/^[a-f0-9]{64}$/i.test(catalog.source_sha256||'') ||
        !Array.isArray(catalog.puzzles) || !Array.isArray(puzzles) || !rules ||
        (strict && (catalog.puzzles.length!==240 || puzzles.length!==240))) {
      stats.globalError='CATALOGO_INVALIDO';
      return {byId,errors,stats};
    }
    const original=new Map(puzzles.map(p=>[p.id,p]));
    if (original.size!==puzzles.length) {
      stats.globalError='IDENTIDADE_BASE_DUPLICADA';return {byId,errors,stats};
    }
    const counts=new Map();
    for (const e of catalog.puzzles) if (isObj(e) && typeof e.exercise_id==='string')
      counts.set(e.exercise_id,(counts.get(e.exercise_id)||0)+1);
    const catalogById=new Map();
    for (const e of catalog.puzzles) if (isObj(e) && typeof e.exercise_id==='string' && counts.get(e.exercise_id)===1)
      catalogById.set(e.exercise_id,e);
    for (const p of puzzles) {
      try {
        if (counts.get(p.id)>1) throw Error('ID_DUPLICADO');
        const e=catalogById.get(p.id);if (!e) throw Error('ID_INEXISTENTE');
        const normalized=normalizeItem(e,p,rules);
        byId.set(p.id,normalized);
        if (normalized.different) stats.divergences++;
      } catch (e) { errors.set(p.id,String(e.message||e)); }
    }
    stats.valid=byId.size;
    stats.unavailable=puzzles.length-stats.valid;
    return {byId,errors,stats};
  }
  return Object.freeze({ROOT_SCHEMA,ITEM_SCHEMA,normalizeCatalog,normalizeItem,verifyPv});
});