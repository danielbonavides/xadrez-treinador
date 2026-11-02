const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Seq=require('../adaptive/sequence-3.js');
const html=fs.readFileSync('index.html','utf8'),catalog=JSON.parse(html.match(/const DATA=(.*);\r?\n/)[1]).puzzles;
const bundle=JSON.parse(fs.readFileSync('teste-v1.4/stockfish-240-public.json','utf8'));
const byEvidence=new Map(bundle.records.map(x=>[x.exercise_id,x]));
const context=vm.createContext({});vm.runInContext(html.slice(html.indexOf('const R88='),html.indexOf('// v1.2.0 — áudio'))+';globalThis.R=R88;',context);
const R=context.R;
test('3-move plan eligibility: only 227 valid five-ply G5 lines',()=>{
 const ready=catalog.filter(p=>Seq.build(p,byEvidence.get(p.id),R).status==='ready');
 assert.equal(ready.length,227);
 assert.equal(catalog.length-ready.length,13);
});
test('every eligible position completes exactly three human turns and two forced replies',()=>{
 let n=0;
 for(const p of catalog){
  const plan=Seq.build(p,byEvidence.get(p.id),R);if(plan.status!=='ready')continue;
  let sess=Seq.begin(p,plan,R);
  for(let i=0;i<3;i++){
   const uci=plan.line[2*i];
   sess=Seq.play(sess,uci,R);
   if(i<2){assert.equal(sess.status,'playing');assert.equal(sess.turn,2*i+2);assert.equal(sess.automatic_reply,plan.line[2*i+1]);}
   else assert.equal(sess.status,'complete');
  }
  assert.equal(sess.player_moves.length,3);
  assert.equal(sess.opponent_moves.length,2);n++;
 }
 assert.equal(n,227);
});
test('legal deviation terminates neutrally and never invents an opponent move',()=>{
 let candidate=null;
 for(const p of catalog){
  const plan=Seq.build(p,byEvidence.get(p.id),R);if(plan.status!=='ready')continue;
  const options=R.legal(R.parse(p.fen)).map(R.uci).filter(uci=>uci!==plan.line[0]);
  if(options.length){candidate={p,plan,uci:options[0]};break;}
 }
 assert(candidate);
 let sess=Seq.begin(candidate.p,candidate.plan,R);
 sess=Seq.play(sess,candidate.uci,R);
 assert.equal(sess.status,'deviation');assert.equal(sess.deviation_ply,1);
 assert.equal(sess.opponent_moves.length,0);assert.equal(sess.player_moves.length,1);
});
test('missing, short or mismatched evidence fails closed',()=>{
 const p=catalog[0],e=byEvidence.get(p.id);
 assert.equal(Seq.build(p,null,R).status,'unavailable');
 assert.equal(Seq.build(p,{...e,exercise_id:'EX9999'},R).status,'unavailable');
 assert.equal(Seq.build(p,e,R).status,'unavailable');
 assert.equal(Seq.build(p,{...e,quality:{...e.quality,diagnostic_certified:true}},R).status,'unavailable');
});
test('hint does not advance turn or mutate board',()=>{
 const p=catalog.find(p=>Seq.build(p,byEvidence.get(p.id),R).status==='ready');
 const plan=Seq.build(p,byEvidence.get(p.id),R),sess=Seq.begin(p,plan,R);
 assert.equal(Seq.hint(sess),plan.line[0]);assert.equal(sess.turn,0);
});
