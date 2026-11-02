/* Sons originais XADREZ — toques secos, sintéticos, sem arquivos ou requisições externas.
 * Web Audio apenas após gesto do usuário; não bloqueia lances se áudio estiver indisponível.
 */
(function(root){
 'use strict';
 const presets=Object.freeze({
  move:      Object.freeze({body:226,cutoff:1220,duration:.060,level:.045,second:0}),
  correct:   Object.freeze({body:260,cutoff:1560,duration:.063,level:.049,second:.019}),
  capture:   Object.freeze({body:175,cutoff:910,duration:.084,level:.060,second:.044}),
  check:     Object.freeze({body:288,cutoff:1850,duration:.075,level:.055,second:.051}),
  castle:    Object.freeze({body:206,cutoff:1150,duration:.065,level:.047,second:.048}),
  promotion: Object.freeze({body:270,cutoff:1620,duration:.068,level:.051,second:.031})
 });
 function classify({check=false,capture=false,correct=false,castle=false,promotion=false}={}){
  if(check)return 'check';
  if(capture)return 'capture';
  if(correct)return 'correct';
  if(promotion)return 'promotion';
  if(castle)return 'castle';
  return 'move';
 }
 // Buffer determinístico de percussão, curto, com decaimento: som seco de madeira, sem apito melódico.
 function noiseBuffer(ctx){
  const sr=ctx.sampleRate||44100,length=Math.ceil(sr*.11);
  const buffer=ctx.createBuffer(1,length,sr),data=buffer.getChannelData(0);
  let seed=0x51F15;
  for(let i=0;i<length;i++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   data[i]=(seed/4294967296*2-1)*Math.exp(-i/sr/0.018);
  }
  return buffer;
 }
 const cache=typeof WeakMap==='function'?new WeakMap():null;
 function getNoise(ctx){
  if(!cache)return noiseBuffer(ctx);
  let b=cache.get(ctx);
  if(!b){b=noiseBuffer(ctx);cache.set(ctx,b);}
  return b;
 }
 function tap(ctx,buffer,at,p,scale=1){
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),noiseGain=ctx.createGain();
  source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(p.cutoff,at);
  noiseGain.gain.setValueAtTime(.0001,at);
  noiseGain.gain.linearRampToValueAtTime(p.level*scale,at+.0025);
  noiseGain.gain.exponentialRampToValueAtTime(.0001,at+p.duration);
  source.connect(filter);filter.connect(noiseGain);noiseGain.connect(ctx.destination);
  source.start(at);source.stop(at+p.duration+.008);
  // Corpo breve, sem tom sustentado; deixa o ataque parecido com peça tocando madeira.
  const osc=ctx.createOscillator(),body=ctx.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(p.body,at);
  osc.frequency.exponentialRampToValueAtTime(p.body*.66,at+.045);
  body.gain.setValueAtTime(.0001,at);
  body.gain.linearRampToValueAtTime(.025*scale,at+.002);
  body.gain.exponentialRampToValueAtTime(.0001,at+.046);
  osc.connect(body);body.connect(ctx.destination);
  osc.start(at);osc.stop(at+.05);
 }
 function play(ctx,kind='move'){
  if(!ctx||ctx.state==='closed')return false;
  const p=presets[kind]||presets.move;
  try{
   if(typeof ctx.createBufferSource!=='function'||typeof ctx.createOscillator!=='function')return false;
   const buffer=getNoise(ctx),now=ctx.currentTime+.006;
   tap(ctx,buffer,now,p);
   if(p.second)tap(ctx,buffer,now+p.second,p,kind==='check'?.62:.35);
   return true;
  }catch(e){return false;}
 }
 root.BoardToc={classify,play,presets};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.BoardToc;
})(typeof globalThis!=='undefined'?globalThis:this);
