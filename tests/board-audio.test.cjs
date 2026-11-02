const {test}=require('node:test'),assert=require('node:assert/strict');
const BoardToc=require('../adaptive/board-toc.js');
test('som correto, captura e xeque são categorias distintas e têm prioridade explícita',()=>{
 assert.equal(BoardToc.classify({}),'move');
 assert.equal(BoardToc.classify({correct:true}),'correct');
 assert.equal(BoardToc.classify({capture:true}),'capture');
 assert.equal(BoardToc.classify({check:true}),'check');
 assert.equal(BoardToc.classify({correct:true,capture:true}),'capture');
 assert.equal(BoardToc.classify({correct:true,capture:true,check:true}),'check');
 assert.equal(BoardToc.classify({promotion:true}),'promotion');
 assert.equal(BoardToc.classify({castle:true}),'castle');
 for(const name of ['move','correct','capture','check'])assert(BoardToc.presets[name].duration<=.09);
});
function audioMock(){
 const data={sources:0,oscillators:0,buffers:0,starts:[],gains:[],cutoffs:[]};
 const node=()=>({connect(){}});
 const param=()=>({setValueAtTime(v,t){data.gains.push([v,t]);},linearRampToValueAtTime(v,t){data.gains.push([v,t]);},exponentialRampToValueAtTime(v,t){data.gains.push([v,t]);}});
 const ctx={
  state:'running',currentTime:1,sampleRate:44100,destination:node(),
  createBuffer(n,count,rate){data.buffers++;assert.equal(n,1);assert.equal(rate,44100);return {getChannelData:()=>new Float32Array(count)};},
  createBufferSource(){data.sources++;return {...node(),start(t){data.starts.push(t)},stop(){},set buffer(b){assert(b)}};},
  createBiquadFilter(){return {...node(),frequency:param(),type:''};},
  createGain(){return {...node(),gain:param()};},
  createOscillator(){data.oscillators++;return {...node(),frequency:param(),type:'',start(t){data.starts.push(t)},stop(){}};}
 };
 return {ctx,data};
}
test('toc sintetizado é curto, discreto, sem carregar arquivos e com variantes perceptíveis',()=>{
 const {ctx,data}=audioMock();
 assert.equal(BoardToc.play(ctx,'move'),true);
 assert.equal(data.sources,1);
 assert.equal(data.oscillators,1);
 assert.equal(data.buffers,1);
 assert.equal(BoardToc.play(ctx,'correct'),true);
 assert.equal(data.sources,3); // acerto = ataque seco + reflexo suave
 assert.equal(BoardToc.play(ctx,'capture'),true);
 assert.equal(data.sources,5);
 assert.equal(BoardToc.play(ctx,'check'),true);
 assert.equal(data.sources,7);
 assert.equal(data.buffers,1); // cache do ruído por AudioContext
 assert(data.gains.every(([v])=>Number.isFinite(v)&&v>=.0001&&v<=.061));
 assert(BoardToc.presets.capture.body<BoardToc.presets.correct.body);
 assert(BoardToc.presets.check.cutoff>BoardToc.presets.move.cutoff);
});
test('falha na API de áudio é silenciosa e não interfere na legalidade da jogada',()=>{
 assert.equal(BoardToc.play(null,'move'),false);
 assert.equal(BoardToc.play({state:'closed'},'correct'),false);
 assert.equal(BoardToc.play({state:'running',createBufferSource(){throw Error('blocked');},createOscillator(){}},'check'),false);
});
