'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'panel.js'),'utf8');
const results=[];
class Element {
 constructor(id=''){this.id=id;this.listeners={};this.children=[];this.textContent='';this.attrs={};}
 addEventListener(t,f){(this.listeners[t]||=[]).push(f);}
 click(){for(const fn of (this.listeners.click||[]))fn();}
 setAttribute(k,v){this.attrs[k]=v;}
 appendChild(child){this.children.push(child);}
 replaceChildren(){this.children=[];}
}
function harness({fetchImpl,inline=null,normalize=null}={}) {
 const map=Object.fromEntries(['sfResearch','sfToggle','sfStatus','sfDetails','next','reset','show','board','promotionChoice','modal','phase','color'].map(id=>[id,new Element(id)]));
 if(inline!==null){map.sfPublicJSON=new Element('sfPublicJSON');map.sfPublicJSON.textContent=inline;}
 const nav=[new Element('tab')];let writes=0;
 const resolver=normalize||(()=>({byId:new Map([['EX0001',{g5:'e2e4',different:false,lines:Object.fromEntries(['multipv_top_1','multipv_top_2','human_forced','g5_forced'].map(k=>[k,{root_uci:'e2e4',pv_uci:['e2e4'],cp:50,mate:null,depth:10}])),hint:'Cheque',certified:false}],['EX0006',{g5:'e4d5',different:true,lines:Object.fromEntries(['multipv_top_1','multipv_top_2','human_forced','g5_forced'].map(k=>[k,{root_uci:'f3e5',pv_uci:['f3e5'],cp:20,mate:null,depth:10}])),hint:'Explore',certified:false}]]),errors:new Map([['EX9999','FEN_PLY']]),stats:{globalError:null}}));
 const storage={setItem:()=>{writes++;},getItem:()=>null};
 const document={getElementById:id=>map[id]||null,querySelectorAll:selector=>selector==='nav button'?nav:[],createElement:tag=>new Element(tag)};
 const context={window:{XadrezEvidence:{normalizeCatalog:resolver},localStorage:storage},document,
    DATA:{puzzles:[{id:'EX0001'}]},R88:{},current:{id:'EX0001'},fetch:fetchImpl||(()=>Promise.reject(Error('offline'))),
    Promise,queueMicrotask,console};
 vm.runInNewContext(source,context,{timeout:1000});
 return {map,context,storage,get writes(){return writes}};
}
async function settle(){for(let i=0;i<5;i++)await new Promise(setImmediate);}
async function test(label,fn){try{await fn();results.push({test:label,status:'PASS'});console.log('PASS',label)}catch(e){results.push({test:label,status:'FAIL',error:String(e)});console.error('FAIL',label,e.stack||e)}}
(async()=>{
await test('panel_default_off_no_fetch',async()=>{let n=0;const h=harness({fetchImpl:()=>{n++;return Promise.reject(Error('HTTP'))}});assert.equal(n,0);assert.match(h.map.sfStatus.textContent,/Desligado/);assert.equal(h.writes,0)});
await test('panel_missing_json_or_http_does_not_throw',async()=>{const h=harness({fetchImpl:()=>Promise.resolve({ok:false,status:404})});h.map.sfToggle.click();await settle();assert.match(h.map.sfStatus.textContent,/Análise indisponível.*HTTP_404/);assert.equal(h.writes,0)});
await test('panel_malformed_http_json_caught',async()=>{const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.reject(SyntaxError('JSON'))})});h.map.sfToggle.click();await settle();assert.match(h.map.sfStatus.textContent,/Análise indisponível/);assert.equal(h.writes,0)});
await test('panel_malformed_embedded_json_caught',async()=>{const h=harness({inline:'{broken'});h.map.sfToggle.click();await settle();assert.match(h.map.sfStatus.textContent,/Análise indisponível/);assert.equal(h.writes,0)});
await test('panel_fetch_unavailable_caught',async()=>{const h=harness({fetchImpl:()=>{throw Error('fetch nao disponivel')}});h.map.sfToggle.click();await settle();assert.match(h.map.sfStatus.textContent,/Análise indisponível/);assert.equal(h.writes,0)});
await test('panel_disconnected_during_pending_load',async()=>{let resolve;const p=new Promise(r=>resolve=r);const h=harness({fetchImpl:()=>p});h.map.sfToggle.click();await settle();h.map.sfToggle.click();resolve({ok:true,json:()=>Promise.resolve({puzzles:[]})});await settle();assert.match(h.map.sfStatus.textContent,/Desligado/);assert.equal(h.writes,0)});
await test('panel_success_g5_remains_distinct',async()=>{const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})})});h.map.sfToggle.click();await settle();assert.match(h.map.sfStatus.textContent,/Stockfish 19/);assert.ok(h.map.sfDetails.children.some(x=>x.textContent.includes('Sugestão histórica G5: e2e4')));h.context.current={id:'EX0006'};h.map.next.click();await settle();assert.ok(h.map.sfDetails.children.some(x=>x.textContent.includes('não comprova erro')));assert.equal(h.writes,0)});
await test('panel_exercise_specific_error_only',async()=>{const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})})});h.map.sfToggle.click();await settle();h.context.current={id:'EX9999'};h.map.next.click();await settle();assert.match(h.map.sfStatus.textContent,/EX9999/);h.context.current={id:'EX0001'};h.map.next.click();await settle();assert.match(h.map.sfStatus.textContent,/Stockfish 19/);assert.equal(h.writes,0)});
await test('panel_off_switch_no_persistence',async()=>{const h=harness({fetchImpl:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})})});h.map.sfToggle.click();await settle();h.map.sfToggle.click();assert.match(h.map.sfStatus.textContent,/Desligado/);assert.equal(h.map.sfToggle.attrs['aria-pressed'],'false');assert.equal(h.writes,0)});
const fails=results.filter(x=>x.status==='FAIL');console.log(JSON.stringify({total:results.length,pass:results.length-fails.length,fail:fails.length}));if(fails.length)process.exitCode=1;
})();