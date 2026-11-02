'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assertLog=[];
const {normalizeCatalog}=require('./adapter.js');
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'EXERCICIOS_PUBLICOS_240_RESEARCH.json'),'utf8'));
const puzzles=original.puzzles.map(e=>({id:e.exercise_id,fen:e.position.fen_before,ply:e.position.ply,
  melhor_uci:e.candidate.suggested_uci_g5,uci_jogado:e.lines.find(x=>x.kind==='human_forced').root_uci}));
const trees=new Map();
for(const item of original.puzzles){const lookup=new Map();
 for(const line of item.lines){const moves=line.pv_uci;for(let i=0;i<moves.length;i++){
  const prefix=JSON.stringify(moves.slice(0,i));const next=lookup.get(prefix)||new Set();next.add(moves[i]);lookup.set(prefix,next);
 }}trees.set(item.position.fen_before,lookup);
}
const rules={parse:fen=>{if(!trees.has(fen))throw Error('FEN');return {fen,seq:[]};},
 legal:s=>Array.from(trees.get(s.fen).get(JSON.stringify(s.seq))||[]),uci:m=>m,
 apply:(s,m)=>({fen:s.fen,seq:s.seq.concat([m])})};
function clone(){return structuredClone(original)}
function test(name,fn){try{fn();assertLog.push({test:name,status:'PASS'});console.log('PASS',name)}catch(e){assertLog.push({test:name,status:'FAIL',error:String(e)});console.error('FAIL',name,e.stack||e)}}
function run(modified){return normalizeCatalog(modified,puzzles,rules)}
test('real_catalog_240_by_id',()=>{const r=run(original);assert.equal(r.stats.valid,240);assert.equal(r.stats.unavailable,0);assert.equal(r.stats.divergences,68)});
test('schema_root_fail_closed_only_research',()=>{const d=clone();d.schema_version='wrong';assert.equal(run(d).stats.globalError,'CATALOGO_INVALIDO')});
test('missing_catalog',()=>{assert.equal(run(null).stats.globalError,'CATALOGO_INVALIDO')});
test('malformed_json_rejected',()=>{assert.throws(()=>JSON.parse('{not_json'),SyntaxError)});
test('unknown_id_disables_just_missing_puzzle',()=>{const d=clone();d.puzzles[0].exercise_id='EX9999';const r=run(d);assert.equal(r.stats.valid,239);assert.equal(r.errors.get('EX0001'),'ID_INEXISTENTE')});
test('duplicate_ids_disabled',()=>{const d=clone();d.puzzles[1].exercise_id=d.puzzles[0].exercise_id;const r=run(d);assert.equal(r.stats.valid,238);assert.equal(r.errors.get('EX0001'),'ID_DUPLICADO')});
test('fen_mismatch_isolated',()=>{const d=clone();d.puzzles[0].position.fen_before='bad';const r=run(d);assert.equal(r.stats.valid,239);assert.equal(r.errors.get('EX0001'),'FEN_PLY')});
test('ply_mismatch_isolated',()=>{const d=clone();d.puzzles[0].position.ply++;const r=run(d);assert.equal(r.stats.valid,239);assert.equal(r.errors.get('EX0001'),'FEN_PLY')});
test('g5_mismatch_isolated',()=>{const d=clone();d.puzzles[0].candidate.suggested_uci_g5='a2a3';const r=run(d);assert.equal(r.stats.valid,239);assert.equal(r.errors.get('EX0001'),'G5')});
test('illegal_pv_isolated',()=>{const d=clone();d.puzzles[0].lines[0].pv_uci[1]='a2a4';const r=run(d);assert.equal(r.stats.valid,239);assert.equal(r.errors.get('EX0001'),'PV_SCORE_PERSPECTIVA')});
test('cp_mate_type_exclusivity',()=>{const d=clone();d.puzzles[0].lines[0].mate_in_pov_player=3;const r=run(d);assert.equal(r.stats.valid,239)});
test('mate_not_cp_fabrication',()=>{const d=clone();const a=d.puzzles.find(x=>x.exercise_id==='EX0215');assert.ok(a.lines.some(x=>x.mate_in_pov_player!==null));assert.equal(run(d).stats.valid,240)});
test('privacy_extra_id_rejected',()=>{const d=clone();d.puzzles[0].game_id='123456';const r=run(d);assert.equal(r.stats.valid,239);assert.equal(r.errors.get('EX0001'),'PRIVACIDADE_OU_SCHEMA')});
test('uncertified_fails_when_flagged_certified',()=>{const d=clone();d.puzzles[0].quality.diagnostic_certified=true;const r=run(d);assert.equal(r.stats.valid,239)});
test('g5_stockfish_disagreement_not_error',()=>{const r=run(original);assert.equal(r.byId.get('EX0006').different,true);assert.equal(r.byId.get('EX0006').certified,false)});
test('panel_no_localstorage_or_scheduler_writes',()=>{const js=fs.readFileSync(path.join(__dirname,'panel.js'),'utf8');assert.doesNotMatch(js,/localStorage\s*\.|setItem\s*\(/);assert.doesNotMatch(js,/stage\s*=|interval\s*=|acertou\s*=/)});
test('panel_disable_switch_is_ephemeral',()=>{const js=fs.readFileSync(path.join(__dirname,'panel.js'),'utf8');assert.match(js,/let enabled=false/);assert.match(js,/enabled=false;nonce\+\+/)});
test('http_failure_is_optional',()=>{const js=fs.readFileSync(path.join(__dirname,'panel.js'),'utf8');assert.match(js,/if\(!response.ok\)throw Error/);assert.match(js,/\.catch\(error=>\{failure=/)});
const fails=assertLog.filter(x=>x.status==='FAIL');
console.log(JSON.stringify({total:assertLog.length,pass:assertLog.length-fails.length,fail:fails.length,results:assertLog},null,2));
if(fails.length)process.exitCode=1;