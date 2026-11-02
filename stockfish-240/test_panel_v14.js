'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const Adaptive=require('../adaptive/core.js');
const Evidence=require('./adapter.js');
global.XadrezEvidence=Evidence;
const EVIDENCE=JSON.parse(fs.readFileSync(path.join(__dirname,'EXERCICIOS_PUBLICOS_240_RESEARCH.json'),'utf8'));
const html=fs.readFileSync(path.join(__dirname,'..','teste-v1.4','index.html'),'utf8');
const inline=html.match(/<script>const DATA=([\s\S]*?)<\/script>/);
assert.ok(inline,'v1.4 preview script missing');
const body=inline[1],end=body.indexOf(';\n');
assert.ok(end>0,'DATA JSON boundary missing');
const DATA=JSON.parse(body.slice(0,end));
const chess=body.match(/const R88=\{\};[\s\S]*?R88\.uci=m=>[^;]*;/);
assert.ok(chess,'R88 missing');
const R88=vm.runInNewContext(chess[0]+';R88;',Object.create(null),{timeout:3000});
class Element{
 constructor(id=''){this.id=id;this.listeners={};this.children=[];this.textContent='';this.attrs={};this.dataset={};this.style={};}
 addEventListener(type,fn){(this.listeners[type]||=[]).push(fn);}
 click(){for(const fn of this.listeners.click||[])fn();}
 setAttribute(k,v){this.attrs[k]=v;}
 appendChild(child){this.children.push(child);}
 replaceChildren(){this.children=[];}
}
function harness({fetchImpl,inlineJSON=null,currentId='EX0001',removeFirst=false}={}){
 const ids=['sfResearch','sfToggle','sfStatus','sfDetails','next','reset','show','board','promotionChoice','modal','phase','color','refreshQueue','trainingMode','cadence','importProgress'];
 const map=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
 map.sfResearch.dataset.jsonUrl='../stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json';
 if(inlineJSON!==null){map.sfPublicJSON=new Element('sfPublicJSON');map.sfPublicJSON.textContent=inlineJSON;}
 const nav=[new Element('trainer-tab')],windowEvents={},documentEvents={};let writes=0;
 const storage={getItem(){return null;},setItem(){writes++;}};
 const document={hidden:false,getElementById:id=>map[id]||null,querySelectorAll:()=>nav,createElement:tag=>new Element(tag),addEventListener:(t,f)=>{documentEvents[t]=f;}};
 const window={localStorage:storage,addEventListener:(t,f)=>{windowEvents[t]=f;}};
 const context={document,window,Adaptive,DATA,R88,current:{id:currentId},Promise,queueMicrotask,console};
 if(fetchImpl!==undefined)context.fetch=fetchImpl;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'panel.js'),'utf8'),context,{timeout:1000});
 return {map,context,windowEvents,documentEvents,get writes(){return writes;}};
}
async function settle(){for(let i=0;i<8;i++)await new Promise(setImmediate);}
const results=[];
async function check(name,fn){try{await fn();results.push({test:name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({test:name,status:'FAIL',error:String(e)});console.error('FAIL',name,e.stack||e);}}
(async()=>{
 await check('V14-P01 default off does not fetch evidence or touch storage',async()=>{
  let calls=0;const h=harness({fetchImpl:()=>{calls++;return Promise.reject(Error('unexpected'));}});
  assert.equal(calls,0);assert.match(h.map.sfStatus.textContent,/Desligado/);assert.equal(h.writes,0);
 });
 await check('V14-P02 uses preview-relative evidence URL and real PedagogyAdapter',async()=>{
  const calls=[];const h=harness({currentId:'EX0006',fetchImpl:(url,options)=>{calls.push({url,options});return Promise.resolve({ok:true,json:()=>Promise.resolve(EVIDENCE)});}});
  h.map.sfToggle.click();await settle();
  assert.equal(calls[0].url,'../stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json');
  assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.cache,'no-store');
  assert.match(h.map.sfStatus.textContent,/Stockfish 19/);
  const text=h.map.sfDetails.children.map(x=>x.textContent).join(' ');
  assert.match(text,/Sugestão histórica G5/);assert.match(text,/As sugestões diferem/);
  assert.match(text,/não comprova erro do G5/);assert.equal(h.writes,0);
 });
 await check('V14-P03 HTTP failure leaves adaptive preview available',async()=>{
  const h=harness({fetchImpl:()=>Promise.resolve({ok:false,status:404})});h.map.sfToggle.click();await settle();
  assert.match(h.map.sfStatus.textContent,/Análise indisponível.*HTTP_404/);assert.equal(h.writes,0);
 });
 await check('V14-P04 malformed response JSON is caught without affecting trainer',async()=>{
  const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.reject(SyntaxError('JSON'))})});h.map.sfToggle.click();await settle();
  assert.match(h.map.sfStatus.textContent,/Análise indisponível/);assert.equal(h.writes,0);
 });
 await check('V14-P05 malformed embedded JSON is caught',async()=>{
  const h=harness({inlineJSON:'{broken',fetchImpl:()=>{throw Error('fetch should not run');}});h.map.sfToggle.click();await settle();
  assert.match(h.map.sfStatus.textContent,/Análise indisponível/);assert.equal(h.writes,0);
 });
 await check('V14-P06 missing fetch implementation is caught',async()=>{
  const h=harness();h.map.sfToggle.click();await settle();assert.match(h.map.sfStatus.textContent,/Análise indisponível/);assert.equal(h.writes,0);
 });
 await check('V14-P07 disabling during pending fetch prevents late render',async()=>{
  let resolve;const wait=new Promise(r=>resolve=r);const h=harness({fetchImpl:()=>wait});h.map.sfToggle.click();await settle();h.map.sfToggle.click();
  resolve({ok:true,json:()=>Promise.resolve(EVIDENCE)});await settle();
  assert.match(h.map.sfStatus.textContent,/Desligado/);assert.equal(h.map.sfToggle.attrs['aria-pressed'],'false');assert.equal(h.writes,0);
 });
 await check('V14-P08 missing evidence row disables only that exercise',async()=>{
  const partial=EVIDENCE;const altered={...partial,puzzles:partial.puzzles.filter(p=>p.exercise_id!=='EX0001')};
  const h=harness({currentId:'EX0001',fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.resolve(altered)})});h.map.sfToggle.click();await settle();
  assert.match(h.map.sfStatus.textContent,/EX0001.*ID_INEXISTENTE/);
  h.context.current={id:'EX0002'};h.map.next.click();await settle();assert.match(h.map.sfStatus.textContent,/Stockfish 19/);assert.equal(h.writes,0);
 });
 await check('V14-P09 panel toggle is ephemeral and never writes adaptive or attempt keys',async()=>{
  const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.resolve(EVIDENCE)})});
  h.map.sfToggle.click();await settle();h.map.sfToggle.click();
  assert.match(h.map.sfStatus.textContent,/Desligado/);assert.equal(h.map.sfToggle.attrs['aria-pressed'],'false');assert.equal(h.writes,0);
 });
 await check('V14-P10 adaptive queue, preference and import events refresh read-only panel',async()=>{
  const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.resolve(EVIDENCE)})});
  h.map.sfToggle.click();await settle();
  assert.equal(typeof h.map.refreshQueue.listeners.change?.[0],'function');
  assert.equal(typeof h.map.trainingMode.listeners.change?.[0],'function');
  assert.equal(typeof h.map.importProgress.listeners.change?.[0],'function');
  assert.equal(typeof h.windowEvents.storage,'function');assert.equal(typeof h.documentEvents.visibilitychange,'function');
  assert.equal(h.writes,0);
 });
 const fails=results.filter(x=>x.status==='FAIL');console.log(JSON.stringify({total:results.length,pass:results.length-fails.length,fail:fails.length,results},null,2));
 if(fails.length)process.exitCode=1;
})();
