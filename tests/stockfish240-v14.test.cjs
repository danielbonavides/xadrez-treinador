'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const A=require('../adaptive/core.js');
const Evidence=require('../stockfish-240/adapter.js');
global.XadrezEvidence=Evidence;
const html=fs.readFileSync('teste-v1.4/index.html','utf8');
const baseline=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>const DATA=([\s\S]*?)<\/script>/);
assert.ok(script,'v1.4 preview inline script missing');
const body=script[1],dataEnd=body.indexOf(';\n');
assert.ok(dataEnd>0,'DATA JSON boundary missing');
const DATA=JSON.parse(body.slice(0,dataEnd));
const chess=body.match(/const R88=\{\};[\s\S]*?R88\.uci=m=>[^;]*;/);
assert.ok(chess,'v1.4 R88 engine missing');
const R=vm.runInNewContext(chess[0]+';R88;',Object.create(null),{timeout:3000});
const evidence=JSON.parse(fs.readFileSync('stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json','utf8'));
const legal=(fen,uci)=>R.legal(R.parse(fen)).some(m=>R.uci(m)===uci);
const revisions=Object.fromEntries(DATA.puzzles.map(p=>[p.id,crypto.createHash('sha256').update(p.id+'\n'+p.fen+'\n'+p.melhor_uci).digest('hex')]));
const catalog=A.ExerciseCatalog(DATA.puzzles,revisions,legal);
const now='2026-11-02T00:00:00.000Z';
const event={event_id:'evt-v14-stockfish-isolation',timestamp_utc:'2026-11-01T00:00:00.000Z',id:DATA.puzzles[0].id,ply:DATA.puzzles[0].ply,uci_tentado:DATA.puzzles[0].melhor_uci,uci_sugerido_g5:DATA.puzzles[0].melhor_uci,acertou:true,modalidade:DATA.puzzles[0].modalidade,perda_cp_bruta:DATA.puzzles[0].perda_cp,catalog_revision:catalog[0].catalog_revision};
const events=A.LegacyAttemptAdapter([event],catalog,now,legal,revisions);
const scheduleBefore=A.AdaptiveScheduler(catalog,events,now);
const prefs=A.preferences({default_mode:'misto'});
const queueBefore=A.QueueBuilder(scheduleBefore,prefs);
test('V14-01 real 240 catalog joins 240/240 and preserves 68 non-diagnostic differences',()=>{
 const result=A.PedagogyAdapter(evidence,DATA.puzzles,R);
 assert.equal(DATA.puzzles.length,240);assert.equal(result.available,true);assert.equal(result.status,'ready');
 assert.equal(result.stats.valid,240);assert.equal(result.stats.unavailable,0);assert.equal(result.stats.divergences,68);
 assert.equal(result.explanation,null);assert.equal(result.byId.get('EX0006').different,true);assert.equal(result.byId.get('EX0006').certified,false);
});
test('V14-02 a missing evidence row disables only that exercise',()=>{
 const partial=structuredClone(evidence);partial.puzzles=partial.puzzles.filter(p=>p.exercise_id!=='EX0001');
 const result=A.PedagogyAdapter(partial,DATA.puzzles,R);
 assert.equal(result.available,true);assert.equal(result.status,'partial');assert.equal(result.stats.valid,239);
 assert.equal(result.errors.get('EX0001'),'ID_INEXISTENTE');assert.ok(result.byId.has('EX0002'));
});
test('V14-03 missing and invalid root schemas fail closed without explanations',()=>{
 assert.equal(A.PedagogyAdapter(null,DATA.puzzles,R).status,'not_loaded');
 const bad=A.PedagogyAdapter({...evidence,schema_version:'wrong'},DATA.puzzles,R);
 assert.equal(bad.available,false);assert.equal(bad.status,'invalid_catalog');assert.equal(bad.explanation,null);
});
test('V14-04 scheduler stages, due intervals and queue are invariant before and after pedagogy validation',()=>{
 const beforeData=JSON.stringify(DATA),beforeEvidence=JSON.stringify(evidence),beforeEvents=JSON.stringify(events),beforeCatalog=JSON.stringify(catalog);
 assert.equal(A.PedagogyAdapter(evidence,DATA.puzzles,R).available,true);
 const afterEvents=A.LegacyAttemptAdapter([event],catalog,now,legal,revisions);
 const scheduleAfter=A.AdaptiveScheduler(catalog,afterEvents,now),queueAfter=A.QueueBuilder(scheduleAfter,prefs);
 assert.deepEqual(scheduleAfter,scheduleBefore);assert.deepEqual(queueAfter,queueBefore);
 assert.equal(JSON.stringify(events),beforeEvents);assert.equal(JSON.stringify(catalog),beforeCatalog);
 assert.equal(JSON.stringify(DATA),beforeData);assert.equal(JSON.stringify(evidence),beforeEvidence);
});
test('V14-05 PedagogyAdapter does not read or write browser storage',()=>{
 let reads=0,writes=0,raw='unchanged';
 const storage={getItem(){reads++;return raw;},setItem(k,v){writes++;raw=v;}};
 const prior=storage.getItem('xadrez_v1_attempts_test_v1_4');
 assert.equal(A.PedagogyAdapter(evidence,DATA.puzzles,R).available,true);
 assert.equal(reads,1);assert.equal(writes,0);assert.equal(raw,prior);
});
test('V14-06 existing F5 panel uses full PedagogyAdapter and keeps local file import',()=>{
 assert.ok(html.includes('id="stockfishBundle"'));assert.ok(html.includes('id="stockfishEvidence"'));
 assert.ok(html.includes('src="../stockfish-240/adapter.js"'));
 assert.ok(html.includes('Adaptive.PedagogyAdapter(bundle,DATA.puzzles,R88)'));
 assert.ok(!html.includes('stockfish-f5.js'));
 assert.ok(!html.includes('fetch('));
});
test('V14-08 panel disable is ephemeral and has no scheduler dependency',()=>{
 const integration=fs.readFileSync('adaptive/integration.js','utf8');
 assert.ok(html.includes('id="stockfishDisable"'));
 assert.match(integration,/stockfishPedagogy=null;stockfishDisabled=true/);
 assert.doesNotMatch(integration.slice(integration.indexOf("stockfishDisable")),/localStorage|setItem\\s*\\(|AdaptiveScheduler|QueueBuilder/);
});
test('V14-07 v1.2 main baseline remains byte-identical and preview storage remains test-only',()=>{
 const b=Buffer.from(baseline.replace(/\r\n/g,'\n'));
 assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex'),'2b3990a71c0a42cd29b7adbed3a95f5bc9afef3b');
 assert.ok(html.includes('xadrez_v1_attempts_test_v1_4'));assert.ok(html.includes('xadrez_v1_4_preferences_test_v1'));
 assert.ok(html.includes('xadrez_web_test_v1_4_theme'));assert.ok(html.includes('xadrez_web_test_v1_4_sound'));
 assert.ok(!html.includes("getItem('xadrez_v1_attempts')"));assert.ok(!html.includes("setItem('xadrez_v1_attempts'"));assert.ok(!html.includes('localStorage.clear'));
});
