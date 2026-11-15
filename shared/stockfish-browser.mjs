// Stockfish.js 19 Lite Single-Threaded (GPL-3.0) — isolated browser UCI worker.
// Self-hosted JS + matching WASM adjacent in vendor/stockfish/; no CDN, Blob or importScripts.
// No cross-origin isolation / SharedArrayBuffer required. Lazy startup on first analysis.
export const ENGINE_URL=new URL('../vendor/stockfish/stockfish-19-lite-single.js',import.meta.url).href;
export const WASM_URL=new URL('../vendor/stockfish/stockfish-19-lite-single.wasm',import.meta.url).href;

export class BrowserStockfish {
 constructor(){this.worker=null;this.ready=false;this.boot=null;this.bootReject=null;this.pending=null;this.initTimer=null;}
 start(){
  if(this.ready)return Promise.resolve();
  if(this.boot)return this.boot;
  if(typeof Worker==='undefined'||typeof WebAssembly==='undefined')return Promise.reject(Error('Stockfish indisponível: navegador sem Web Worker/WebAssembly'));
  this.boot=new Promise((resolve,reject)=>{
   this.bootReject=reject;
   let worker;
   const fail=error=>{
    const message=error?.message||String(error||'falha no Worker');
    const bootReject=this.bootReject;this.bootReject=null;
    const job=this.pending;this.pending=null;
    clearTimeout(this.initTimer);this.initTimer=null;
    if(job){clearTimeout(job.timer);job.reject(Error('Stockfish indisponível: '+message))}
    this.worker=null;this.ready=false;this.boot=null;
    try{worker?.terminate()}catch{}
    if(bootReject)bootReject(Error('Stockfish indisponível: '+message));
   };
   try {
    // Direct same-origin worker: Emscripten locates .wasm next to its own script URL.
    worker=new Worker(ENGINE_URL,{type:'classic',name:'xadrez-stockfish-lite'});
    this.worker=worker;
    this.initTimer=setTimeout(()=>fail(Error('timeout de inicialização (30s)')),30000);
    worker.onerror=event=>{event?.preventDefault?.();fail(Error(event?.message||'erro ao carregar worker/WASM'))};
    worker.onmessageerror=()=>fail(Error('mensagem inválida do worker'));
    worker.onmessage=event=>{
     for(const raw of String(event.data??'').split(/\r?\n/)){
      const line=raw.trim();
      if(line==='uciok'){worker.postMessage('isready');continue}
      if(line==='readyok'&&this.bootReject){
       clearTimeout(this.initTimer);this.initTimer=null;this.bootReject=null;
       this.ready=true;resolve();continue;
      }
      const job=this.pending;
      if(line.startsWith('info ')&&job){
       const cp=line.match(/\bscore cp (-?\d+)/),mate=line.match(/\bscore mate (-?\d+)/);
       if(cp||mate){
        const depth=line.match(/\bdepth (\d+)/),pv=line.match(/\bpv (.+)$/);
        job.info={cp:cp?Number(cp[1]):null,mate:mate?Number(mate[1]):null,depth:depth?Number(depth[1]):null,pv:pv?pv[1].split(' ').slice(0,10):[]};
       }
      }
      if(line.startsWith('bestmove ')&&job){
       this.pending=null;clearTimeout(job.timer);
       const move=line.split(/\s+/)[1];
       if(!move||move==='(none)')job.reject(Error('Stockfish não encontrou lance legal'));
       else job.resolve({move,...(job.info||{cp:null,mate:null,depth:null,pv:[]})});
      }
     }
    };
    worker.postMessage('uci');
   }catch(error){fail(error)}
  });
  return this.boot;
 }
 async analyze(fen,{depth=9,limit=1300,skill=12}={}){
  if(typeof fen!=='string'||fen.split(' ').length<4)throw Error('FEN inválido para Stockfish');
  if(this.pending)this.stop();
  await this.start();
  if(!this.ready||!this.worker)throw Error('Stockfish indisponível: worker não inicializado');
  const time=Math.max(100,Math.min(5000,Math.round(limit)));
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{
    const job=this.pending;
    if(!job)return;
    this.pending=null;job.reject(Error('tempo de análise excedido'));
    this.stop();
   },Math.max(3000,time+3000));
   this.pending={resolve,reject,timer,info:null};
   try{
    this.worker.postMessage('setoption name Skill Level value '+Math.max(0,Math.min(20,Math.round(skill))));
    this.worker.postMessage('position fen '+fen);
    this.worker.postMessage('go depth '+Math.max(2,Math.min(18,Math.round(depth)))+' movetime '+time);
   }catch(error){this.stop();reject(error)}
  });
 }
 stop(){
  if(this.pending){const job=this.pending;this.pending=null;clearTimeout(job.timer);job.reject(Error('análise cancelada'))}
  if(this.bootReject){const reject=this.bootReject;this.bootReject=null;reject(Error('inicialização cancelada'))}
  clearTimeout(this.initTimer);this.initTimer=null;
  try{this.worker?.terminate()}catch{}
  this.worker=null;this.ready=false;this.boot=null;
 }
}
