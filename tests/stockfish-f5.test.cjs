const test=require('node:test'),assert=require('node:assert/strict');
const F5=require('../adaptive/stockfish-f5.js');
const e={id:'EX0001',fen:'8/8/8/8/8/8/4P3/4K2k w - - 0 1',ply:1,melhor_uci:'e2e4'};
const legal=(_,uci)=>uci==='e2e4';
const data={schema_version:'xadrez.pedagogia.v1.3',exercise_id:e.id,position:{fen_before:e.fen,ply:1},candidate:{suggested_uci_g5:'e2e4'},verification:{status:'ENGINE_EVIDENCE_RESEARCH_NOT_DIAGNOSIS',engine:'Stockfish',depth:10},quality:{diagnostic_certified:false,legal_moves_verified:true},lines:[{root_uci:'e2e4',pv_uci:['e2e4'],score_cp_pov_player:25,mate_in_pov_player:null}]};
test('F5 missing evidence fails closed',()=>assert.equal(F5.normalize(null,e,legal).status,'unavailable'));
test('F5 accepts research-only contract without certifying diagnostics',()=>{const m=F5.normalize(data,e,legal);assert.equal(m.status,'research');assert.equal(m.diagnostic_certified,false);assert.match(F5.render(m),/NÃO certifica/);});
test('F5 exercise ID mismatch fails closed',()=>assert.equal(F5.normalize({...data,exercise_id:'EX0002'},e,legal).status,'unavailable'));
test('F5 illegal root fails closed',()=>assert.equal(F5.normalize({...data,lines:[{root_uci:'a2a4',pv_uci:['a2a4']}]},e,legal).status,'unavailable'));
test('F5 certified claim is not accepted as experimental contract',()=>assert.equal(F5.normalize({...data,quality:{diagnostic_certified:true}},e,legal).status,'unavailable'));
test('F5 malformed lines fail closed',()=>assert.equal(F5.normalize({...data,lines:'bad'},e,legal).status,'unavailable'));
test('F5 unknown schema fails closed',()=>assert.equal(F5.normalize({...data,schema_version:'unknown'},e,legal).status,'unavailable'));

test('F5 public 240 dataset is privacy-allowlisted, catalog-matched, and all PVs legal',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const raw=fs.readFileSync('teste-v1.4/stockfish-240-public.json','utf8'),bundle=JSON.parse(raw);
 const html=fs.readFileSync('index.html','utf8');
 const catalog=JSON.parse(html.match(/const DATA=(.*);\\r?\\n/)[1]).puzzles;
 const context=vm.createContext({});
 vm.runInContext(html.slice(html.indexOf('const R88='),html.indexOf('// v1.2.0 — áudio'))+';globalThis.R=R88;',context);
 const R=context.R,byId=new Map(catalog.map(x=>[x.id,x]));
 assert.equal(bundle.record_count,240);assert.equal(bundle.research_only,true);
 assert.equal(bundle.records.length,240);assert.equal(new Set(bundle.records.map(x=>x.exercise_id)).size,240);
 assert(!/[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}/i.test(raw));
 assert(!raw.includes('http://')&&!raw.includes('https://'));
 let pv=0,plies=0;
 for(const record of bundle.records){
  assert.deepEqual(Object.keys(record).sort(),['candidate','exercise_id','lines','position','quality','schema_version','verification']);
  assert.equal(record.quality.diagnostic_certified,false);
  assert.equal(record.verification.status,'ENGINE_EVIDENCE_RESEARCH_NOT_DIAGNOSIS');
  const p=byId.get(record.exercise_id);assert(p);
  assert.equal(record.position.fen_before,p.fen);
  assert.equal(record.position.ply,p.ply);
  assert.equal(record.candidate.suggested_uci_g5,p.melhor_uci);
  const model=F5.normalize(record,p,(fen,uci)=>R.legal(R.parse(fen)).some(m=>R.uci(m)===uci));
  assert.equal(model.status,'research',record.exercise_id);
  assert.equal(record.lines.length,4);
  for(const line of record.lines){
   let state=R.parse(p.fen);
   for(const uci of line.pv_uci){
    const move=R.legal(state).find(m=>R.uci(m)===uci);
    assert(move,'PV illegal: '+record.exercise_id+' '+line.kind+' '+uci);
    state=R.apply(state,move);plies++;
   }
   pv++;
  }
 }
 assert.equal(pv,960);assert.equal(plies,8360);
});
