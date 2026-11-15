// Shared audio and piece animation for XADREZ trainers. Original synthesized effects; no third-party sound assets.
export function createBoardEffects({storage=globalThis.localStorage}={}){
 const key='xadrez_web_sound_volume_v1';
 let volume=0.8,context=null;
 try{const stored=storage.getItem(key);const n=Number(stored);if(stored!==null&&Number.isFinite(n)&&n>=0&&n<=1)volume=n}catch{}
 const setVolume=n=>{volume=Math.max(0,Math.min(1,Number(n)||0));try{storage.setItem(key,String(volume))}catch{}};
 function sound(kind){
  if(!volume)return;
  const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return;
  try{
   context||=new C();if(context.state==='suspended')context.resume().catch(()=>{});
   const now=context.currentTime+.012;
   const profiles={move:[155,.065,.6],capture:[112,.11,1],check:[420,.19,.7],castle:[190,.12,.75],promotion:[550,.21,.8]};
   const [hz,duration,strength]=profiles[kind]||profiles.move;
   const osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
   osc.type=kind==='check'||kind==='promotion'?'triangle':'sawtooth';
   osc.frequency.setValueAtTime(hz,now);osc.frequency.exponentialRampToValueAtTime(Math.max(65,hz*.48),now+duration);
   filter.type='lowpass';filter.frequency.value=kind==='capture'?680:kind==='check'?1300:850;
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*strength*.16),now+.006);
   gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   osc.connect(filter);filter.connect(gain);gain.connect(context.destination);osc.start(now);osc.stop(now+duration+.012);
  }catch{}
 }
 function animate(board,from,to,{duration=190}={}){
  if(!board||!from||!to||from===to||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const origin=board.querySelector('[data-square="'+from+'"]'),destination=board.querySelector('[data-square="'+to+'"]');
  if(!origin||!destination)return;
  const piece=origin.querySelector('.piece-svg');if(!piece)return;
  const a=origin.getBoundingClientRect(),b=destination.getBoundingClientRect();
  if(typeof piece.animate!=='function'||!globalThis.document?.body)return;
  const ghost=piece.cloneNode(true);const width=piece.getBoundingClientRect().width;
  Object.assign(ghost.style,{position:'fixed',left:(a.left+(a.width-width)/2)+'px',top:(a.top+(a.height-width)/2)+'px',width:width+'px',height:width+'px',zIndex:'9999',pointerEvents:'none',margin:'0'});
  document.body.appendChild(ghost);
  const animation=ghost.animate([{transform:'translate(0,0)',opacity:1},{transform:'translate('+(b.left-a.left)+'px,'+(b.top-a.top)+'px)',opacity:1}],{duration,easing:'cubic-bezier(.2,.65,.25,1)'});
  animation.onfinish=()=>ghost.remove();animation.oncancel=()=>ghost.remove();
  setTimeout(()=>ghost.remove(),duration+150);
 }
 return {sound,animate,setVolume,get volume(){return volume}};
}
