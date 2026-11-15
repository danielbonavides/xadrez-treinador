// UCI browser adapter. Stockfish.js ASM single-thread from pinned CDN; lazy loading.
// Requires network. Graceful error when CDN, worker, or engine unavailable.
const ENGINE_URL='https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-asm.js';
export class BrowserStockfish{
 constructor(){this.worker=null;this.ready=false;this.pending=null;this.info=null;this.boot=null;}
 async start(){
  if(this.ready)return;
  if(this.boot)return this.boot;
  this.boot=new Promise((resolve,reject)=>{
   let url,worker,done=false;
   const fail=e=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();if(url)URL.revokeObjectURL(url);this.worker=null;this.boot=null;reject(Error('Stockfish indisponível: '+(e?.message||'falha no carregamento'))) };
   const timer=setTimeout(()=>fail(Error('timeout de inicialização')),18000);
   try{
    const code="importScripts("+JSON.stringify(ENGINE_URL)+");";
    url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
    worker=new Worker(url);this.worker=worker;
    worker.onerror=fail;
    worker.onmessage=ev=>{
     for(const line of String(ev.data||'').split(/\r?\n/)){
      if(line==='uciok'){worker.postMessage('isready');continue}
      if(line==='readyok'&&!done){done=true;clearTimeout(timer);URL.revokeObjectURL(url);this.ready=true;resolve();continue}
      if(line.startsWith('info ')&&this.pending){
       const cp=line.match(/\bscore cp (-?\d+)/),mate=line.match(/\bscore mate (-?\d+)/),depth=line.match(/\bdepth (\d+)/),pv=line.match(/\bpv (.+)$/);
       if(cp||mate)this.pending.info={cp:cp?Number(cp[1]):null,mate:mate?Number(mate[1]):null,depth:depth?Number(depth[1]):null,pv:pv?pv[1].split(' ').slice(0,8):[]};
      }
      if(line.startsWith('bestmove ')&&this.pending){const job=this.pending;this.pending=null;clearTimeout(job.timer);job.resolve({move:line.split(' ')[1],...(job.info||{})})}
     }
    };
    worker.postMessage('uci');
   }catch(e){fail(e)}
  });
  return this.boot;
 }
 async analyze(fen,{depth=9,limit=1300,skill=12}={}){
  await this.start();
  if(this.pending){this.worker.postMessage('stop');this.pending.reject(Error('análise substituída'));clearTimeout(this.pending.timer);this.pending=null;this.worker.terminate();this.worker=null;this.ready=false;this.boot=null;await this.start()}
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{if(this.pending){this.pending=null;this.worker?.postMessage('stop');reject(Error('tempo de análise excedido'))}},Math.max(3000,limit+3000));
   this.pending={resolve,reject,timer,info:null};
   this.worker.postMessage('setoption name Skill Level value '+Math.max(0,Math.min(20,Math.round(skill))));
   this.worker.postMessage('position fen '+fen);
   this.worker.postMessage('go depth '+Math.max(2,Math.min(18,Math.round(depth)))+' movetime '+Math.max(100,Math.min(5000,Math.round(limit))));
  });
 }
 stop(){if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(Error('análise cancelada'));this.pending=null}this.worker?.terminate();this.worker=null;this.ready=false;this.boot=null}
}
