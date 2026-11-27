import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {BrowserStockfish,ENGINE_URL,WASM_URL} from '../shared/stockfish-browser.mjs';

const startFen='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

test('Stockfish Lite files self-hosted, pinned and browser-loadable',()=>{
 assert.match(ENGINE_URL,/\/vendor\/stockfish\/stockfish-19-lite-single\.js$/);
 assert.match(WASM_URL,/\/vendor\/stockfish\/stockfish-19-lite-single\.wasm$/);
 const js=readFileSync(new URL('../vendor/stockfish/stockfish-19-lite-single.js',import.meta.url));
 const wasm=readFileSync(new URL('../vendor/stockfish/stockfish-19-lite-single.wasm',import.meta.url));
 assert.ok(js.length>10000&&js.length<100000,'JS glue loader size');
 assert.ok(wasm.length>100000&&wasm.length<10000000,'WASM Lite size');
 assert.deepEqual([...wasm.subarray(0,4)],[0,97,115,109],'WASM magic');
 const sha=value=>createHash('sha256').update(value).digest('hex');
 assert.equal(sha(js),'ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a');
 assert.equal(sha(wasm),'ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de');
 assert.equal(WebAssembly.validate(wasm),true,'WASM binary validates in Node 22');
});

class MockWorker {
 static instances=[];
 constructor(url,options){
  this.url=String(url);this.options=options;this.sent=[];this.terminated=false;this.respond=true;
  MockWorker.instances.push(this);
 }
 postMessage(cmd){
  this.sent.push(cmd);
  if(cmd==='uci')queueMicrotask(()=>this.onmessage?.({data:'id name Stockfish 19\nuciok'}));
  if(cmd==='isready')queueMicrotask(()=>this.onmessage?.({data:'readyok'}));
  if(cmd.startsWith('go ')&&this.respond)queueMicrotask(()=>{
   this.onmessage?.({data:'info depth 8 score cp 35 pv e2e4 e7e5 g1f3'});
   this.onmessage?.({data:'bestmove e2e4 ponder e7e5'});
  });
 }
 terminate(){this.terminated=true}
}

test('Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation',async()=>{
 const saved=globalThis.Worker;globalThis.Worker=MockWorker;
 try{
  const e=new BrowserStockfish();
  const r=await e.analyze(startFen,{depth:8,limit:250,skill:5});
  assert.equal(r.move,'e2e4');
  assert.equal(r.depth,8);
  assert.equal(r.cp,35);
  assert.deepEqual(r.pv.slice(0,2),['e2e4','e7e5']);
  assert.equal(MockWorker.instances[0].url,ENGINE_URL);
  assert.deepEqual(MockWorker.instances[0].options,{type:'classic',name:'xadrez-stockfish-lite'});
  assert.ok(MockWorker.instances[0].sent.includes('setoption name Skill Level value 5'));
  assert.ok(MockWorker.instances[0].sent.includes('position fen '+startFen));
  const old=MockWorker.instances[0];
  e.stop();assert.equal(old.terminated,true);
  const again=await e.analyze(startFen,{skill:20});
  assert.equal(again.move,'e2e4');assert.notEqual(MockWorker.instances[1],old);
  e.stop();
 }finally{globalThis.Worker=saved}
});

test('rejects engine failure, preserves actionable error and permits retry',async()=>{
 const saved=globalThis.Worker;
 class FailWorker extends MockWorker{
  postMessage(cmd){if(cmd==='uci')queueMicrotask(()=>this.onerror?.({message:'WASM não carregou',preventDefault(){}}))}
 }
 globalThis.Worker=FailWorker;
 try{
  const e=new BrowserStockfish();
  await assert.rejects(()=>e.start(),/Stockfish indisponível: WASM não carregou/);
  e.stop();
 }finally{globalThis.Worker=saved}
});

test('rejects startup when browser lacks Web Worker',async()=>{
 const saved=globalThis.Worker;delete globalThis.Worker;
 try{await assert.rejects(new BrowserStockfish().start(),/sem Web Worker\/WebAssembly/)}
 finally{globalThis.Worker=saved}
});

test('real Stockfish Lite binary answers UCI bestmove in Node 22',async()=>{
 const {spawn}=await import('node:child_process');
 const {fileURLToPath}=await import('node:url');
 const fs=await import('node:fs');
 const os=await import('node:os');
 const path=await import('node:path');
 const tempDir=fs.mkdtempSync(path.join(os.tmpdir(),'xadrez-sf-lite-'));
 for(const suffix of ['js','wasm']){
  fs.copyFileSync(fileURLToPath(new URL('../vendor/stockfish/stockfish-19-lite-single.'+suffix,import.meta.url)),path.join(tempDir,'stockfish-19-lite-single.'+suffix));
 }
 // Outside repo "type:module" scope: Stockfish.js expects CommonJS in Node CLI.
 const executable=path.join(tempDir,'stockfish-19-lite-single.js');
 const child=spawn(process.execPath,[executable],{stdio:['pipe','pipe','pipe']});
 try{await new Promise((resolve,reject)=>{
  let output='',stderr='',sent=false,settled=false;
  const timer=setTimeout(()=>finish(Error('Stockfish UCI startup timeout; stderr: '+stderr.slice(-400))),20000);
  function finish(error){
   if(settled)return;settled=true;clearTimeout(timer);
   try{child.stdin.end()}catch{};child.kill();
   if(error)reject(error);else resolve();
  }
  child.on('error',finish);
  child.on('exit',code=>{if(!settled)finish(Error('Stockfish exited '+code+'; stderr: '+stderr.slice(-400)))});
  child.stderr.on('data',data=>{stderr+=String(data)});
  child.stdout.on('data',data=>{
   output+=String(data);
   if(output.includes('uciok')&&!sent){
    sent=true;child.stdin.write('isready\nposition startpos\ngo movetime 300\n');
   }
   if(/bestmove [a-h][1-8][a-h][1-8]/.test(output))finish();
  });
  child.stdin.write('uci\n');
 });}finally{fs.rmSync(tempDir,{recursive:true,force:true})}
});
