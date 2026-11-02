/* F5 — Adaptador opcional experimental. Sem efeito sobre treino ou pontuação. */
(function(root){
'use strict';
const UCI=/^[a-h][1-8][a-h][1-8][qrbn]?$/;
const supported=new Set(['xadrez.pedagogia.v1.3','xadrez.pedagogia.v1']);
function normalize(raw,exercise,legal){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {status:'unavailable',reason:'missing_data'};
 const schema=raw.schema_version;
 if(!supported.has(schema))return {status:'unavailable',reason:'unknown_schema'};
 const pos=raw.position||{},candidate=raw.candidate||{};
 if(raw.exercise_id!==exercise.id||pos.fen_before!==exercise.fen||pos.ply!==exercise.ply||candidate.suggested_uci_g5!==exercise.melhor_uci)return {status:'unavailable',reason:'exercise_mismatch'};
 const verification=raw.verification||{},quality=raw.quality||{};
 if(verification.status!=='ENGINE_EVIDENCE_RESEARCH_NOT_DIAGNOSIS'||quality.diagnostic_certified!==false)return {status:'unavailable',reason:'not_research_contract'};
 if(!Array.isArray(raw.lines)||!raw.lines.length||raw.lines.length>12)return {status:'unavailable',reason:'invalid_lines'};
 const lines=[];
 for(const line of raw.lines){
  if(!line||!UCI.test(line.root_uci)||!Array.isArray(line.pv_uci)||!line.pv_uci.length||line.pv_uci[0]!==line.root_uci||!line.pv_uci.every(x=>typeof x==='string'&&UCI.test(x)))return {status:'unavailable',reason:'invalid_line'};
  if(!legal(exercise.fen,line.root_uci))return {status:'unavailable',reason:'illegal_root'};
  // Verificação da PV integral deve ser executada pelo gerador offline.
  // O cliente não deve inferir legalidade de lances posteriores apenas pela sintaxe UCI.
  if(line.pv_uci.length>1&&raw.quality?.legal_moves_verified!==true)return {status:'unavailable',reason:'unverified_pv'};
  const cp=line.score_cp_pov_player,mate=line.mate_in_pov_player;
  if(cp!=null&&(!Number.isFinite(cp)||mate!=null)||mate!=null&&(!Number.isInteger(mate)||cp!=null))return {status:'unavailable',reason:'invalid_score'};
  lines.push({uci:line.root_uci,pv:line.pv_uci.slice(),cp:cp??null,mate:mate??null});
 }
 return {status:'research',schema_version:schema,exercise_id:raw.exercise_id,engine:verification.engine||'Stockfish',depth:Number.isInteger(verification.depth)?verification.depth:null,lines:Object.freeze(lines),diagnostic_certified:false};
}
function render(model){
 if(!model||model.status!=='research')return 'Evidências Stockfish indisponíveis ou não compatíveis para este exercício. Treinamento G5 permanece inalterado.';
 const fmt=l=>l.uci+' · '+(l.mate!==null?'MATE '+l.mate:l.cp!==null?(l.cp/100).toFixed(2)+' peões (POV jogador)':'avaliação não informada')+' · PV '+l.pv.join(' ');
 return 'Análise Stockfish experimental — NÃO certifica erro nem tática. '+model.engine+(model.depth===null?'':' · profundidade '+model.depth)+'. '+model.lines.map(fmt).join(' | ');
}
root.StockfishF5={normalize,render};
if(typeof module!=='undefined'&&module.exports)module.exports=root.StockfishF5;
})(typeof globalThis!=='undefined'?globalThis:this);
