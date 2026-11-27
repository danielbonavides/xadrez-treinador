const ATTEMPTS_KEY='xadrez_v1_attempts_test_v1_4';
const PREFS_KEY='xadrez_v1_4_preferences_test_v1';
// O getter de localStorage também pode lançar SecurityError.
const storage={getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)};
const recorder=new Adaptive.AttemptRecorder(storage,ATTEMPTS_KEY);
const SEQUENCES_KEY='xadrez_v1_4_sequences_test_v1';
const sequenceRecorder=new Adaptive.AttemptRecorder(storage,SEQUENCES_KEY);
let sequenceMode='1',sequenceRun=null;
const catalog=Adaptive.ExerciseCatalog(DATA.puzzles,CATALOG_REVISIONS,(fen,uci)=>legalUciForFen(fen).includes(uci));
let prefs=Adaptive.preferences(null);
try{prefs=Adaptive.preferences(JSON.parse(storage.getItem(PREFS_KEY)));}catch(e){$('preferenceNotice').textContent='Preferências indisponíveis; usando padrão.';}
let lastMove=null,current=null,sel=null,result=null,visibleState=null,pendingPromotion=null,attempts=recorder.records,counter=0,queue=[],used=new Set();
let projections=[],queueReady=false;
$('exerciseLength').value='1';
$('trainingMode').value=prefs.default_mode;$('cadence').value=String(prefs.new_to_review_ratio[1]);
$('modal').value=prefs.filters.modalidade;$('phase').value=prefs.filters.fase;$('color').value=prefs.filters.cor;
function newEventId(){if(window.crypto&&typeof window.crypto.randomUUID==='function')return 'evt_'+window.crypto.randomUUID();const bytes=new Uint32Array(4);if(window.crypto&&window.crypto.getRandomValues){window.crypto.getRandomValues(bytes);return 'evt_'+Array.from(bytes,n=>n.toString(16)).join('_');}return 'evt_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+'_'+Math.random().toString(36).slice(2);}
const legalityCache=new Map();
function observationLegal(fen,uci){if(!legalityCache.has(fen))legalityCache.set(fen,new Set(legalUciForFen(fen)));return legalityCache.get(fen).has(uci);}
function projectNow(){const now=new Date().toISOString();return Adaptive.AdaptiveScheduler(catalog,Adaptive.LegacyAttemptAdapter(attempts,catalog,now,observationLegal,LEGACY_REVISIONS),now);}
function collectPreferences(){prefs=Adaptive.preferences({...prefs,default_mode:$('trainingMode').value,new_to_review_ratio:[1,Number($('cadence').value)],filters:{modalidade:$('modal').value,fase:$('phase').value,cor:$('color').value}});try{storage.setItem(PREFS_KEY,JSON.stringify(prefs));$('preferenceNotice').textContent='Ritmo salvo neste navegador.';}catch(e){$('preferenceNotice').textContent='Preferências não salvas; válidas somente nesta sessão.';}}
function renderAdaptive(){
 projections=projectNow();
 const rows=projections.filter(p=>(prefs.filters.modalidade==='ALL'||p.modality===prefs.filters.modalidade)&&(prefs.filters.fase==='ALL'||p.phase===prefs.filters.fase)&&(prefs.filters.cor==='ALL'||p.color===prefs.filters.cor));
 const sum=k=>rows.reduce((n,p)=>n+(p[k]||0),0);
 $('adaptiveStats').textContent=`Neste filtro: ${sum('matched_g5')} coincidências com G5 · ${sum('alternative_legal')} alternativas legais · ${rows.filter(p=>p.status==='due').length} revisões vencidas · ${sum('reviews_performed')} revisões realizadas · ${rows.filter(p=>p.status==='new').length} ainda não vistos · ${sum('legacy_events_without_time')} eventos legados sem data · ${sum('time_eligible_events')} eventos datados válidos · ${sum('quarantined_events')} eventos em quarentena.`;
 const globalEvents=Adaptive.LegacyAttemptAdapter(attempts,catalog,new Date().toISOString(),observationLegal,LEGACY_REVISIONS);
 const unknown=globalEvents.filter(a=>a.reason==='unknown_exercise'&&!a.duplicate).length;
 if(unknown)$('adaptiveStats').append(document.createTextNode(` ${unknown} eventos fora do catálogo preservados.`));
 if(globalEvents.some(a=>a.reason==='future_time'))$('adaptiveStats').append(document.createTextNode(' Atenção: há horários futuros no histórico. Confira o relógio do dispositivo; esses eventos não programam revisões.'));
 $('storageStatus').textContent=recorder.error||recorder.pending.length?`Atenção: ${recorder.pending.length} tentativa(s) NÃO SALVA(S). ${recorder.error||''} O histórico persistido não foi descartado; exporte um backup para preservar a sessão.`:`${attempts.length} registros persistidos no armazenamento de testes.`;
 $('retrySave').classList.toggle('hide',!recorder.pending.length);
 renderReview();
}
function renderReview(){
 const p=current&&projections.find(p=>p.exercise_id===current.id);
 if(!p){$('reviewStatus').textContent='';return;}
 const labels={new:'Ainda não visto',legacy_without_schedule:'Legado sem data: sem programação temporal',scheduled:'Revisão programada',due:'Revisão vencida',quarantined:'Eventos incompatíveis em quarentena: sem programação'};
 const hours=p.due_at_utc?Math.max(0,(Date.parse(p.due_at_utc)-Date.now())/3600000):null;
 $('reviewStatus').textContent=labels[p.status]+(hours===null?'':hours===0?' · disponível agora':hours<1?' · em '+Math.ceil(hours*60)+' min':hours<24?' · em '+Math.ceil(hours)+' h':' · em '+Math.ceil(hours/24)+' dias');
}
function downloadBackup(out){if(out&&typeof out==='object'){out.sequence_attempts=sequenceRecorder.backup(null).puzzles_tentados;out.sequence_mode_schema='xadrez.sequence_attempt.v1';}const b=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='XADREZ_TREINO_V1_4_TESTE.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
const mergeAttemptHistories=Adaptive.mergeHistories;
$('retrySave').addEventListener('click',()=>{recorder.retry();attempts=recorder.records;renderAdaptive();});
$('importProgress').addEventListener('change',async function(){
 const file=this.files&&this.files[0];if(!file)return;
 try{if(file.size>5*1024*1024)throw Error('Arquivo maior que 5 MB');const incoming=JSON.parse(await file.text()),records=Array.isArray(incoming)?incoming:incoming&&incoming.puzzles_tentados;
 const sequenceRecords=!Array.isArray(incoming)&&incoming?.sequence_attempts||[];
 if(!Array.isArray(sequenceRecords))throw Error('Sequências inválidas no backup');
 if(sequenceRecords.length)Adaptive.mergeHistories(sequenceRecorder.records,sequenceRecords);
 const before=recorder.records.length,merged=mergeAttemptHistories(recorder.pending,records),r=recorder.save(merged);
 if(!r.saved)throw Error(r.error);
 if(sequenceRecords.length){const seqSaved=sequenceRecorder.save(sequenceRecords);if(!seqSaved.saved)throw Error('Histórico G5 importado; sequência NÃO SALVA: '+seqSaved.error);}
 attempts=recorder.records;$('importNotice').textContent=`Histórico conciliado: ${attempts.length-before} registros adicionados. Preferências atuais preservadas.`;resetQueue();
 }catch(e){$('importNotice').textContent='Importação não aplicada: '+e.message;}this.value='';renderAdaptive();
});
['trainingMode','cadence'].forEach(id=>$(id).addEventListener('change',resetQueue));
$('exerciseLength').addEventListener('change',()=>{sequenceMode=$('exerciseLength').value==='3'?'3':'1';resetQueue();});
$('refreshQueue').addEventListener('click',resetQueue);
window.addEventListener('storage',e=>{if(e.key===ATTEMPTS_KEY){recorder.reload();attempts=recorder.records;queueReady=false;renderAdaptive();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){queueReady=false;renderAdaptive();}});

// F5: leitura automática somente do JSON público, local à prévia, sem persistir evidências.
const stockfishEvidenceById=Object.create(null);
let stockfishManualOverride=false;
function renderStockfishEvidence(){
 const n=$('stockfishEvidence');if(!n)return;
 n.style.whiteSpace='pre-line';
 const raw=current&&stockfishEvidenceById[current.id];
 const model=current?StockfishF5.normalize(raw,current,observationLegal):null;
 n.textContent=StockfishF5.render(model);
}
function applyStockfishBundle(bundle){
 const records=Array.isArray(bundle)?bundle:bundle&&bundle.records;
 if(!Array.isArray(records)||records.length!==240)throw Error('Esperados exatamente 240 registros.');
 if(bundle&&bundle.research_only===false)throw Error('Pacote sem indicação de pesquisa.');
 const next=Object.create(null);
 const expected=new Map(DATA.puzzles.map(p=>[p.id,p]));
 for(const raw of records){
  if(!raw||typeof raw.exercise_id!=='string'||Object.prototype.hasOwnProperty.call(next,raw.exercise_id))throw Error('ID inválido ou duplicado');
  const ref=expected.get(raw.exercise_id);
  if(!ref)throw Error('Exercício desconhecido: '+raw.exercise_id);
  if(raw.quality?.diagnostic_certified!==false||raw.verification?.status!=='ENGINE_EVIDENCE_RESEARCH_NOT_DIAGNOSIS')throw Error('Evidência não experimental: '+raw.exercise_id);
  const parsed=StockfishF5.normalize(raw,ref,observationLegal);
  if(parsed.status!=='research')throw Error('Evidência inválida: '+raw.exercise_id+' / '+parsed.reason);
  next[raw.exercise_id]=raw;
 }
 if(Object.keys(next).length!==expected.size)throw Error('Catálogo incompleto.');
 Object.keys(stockfishEvidenceById).forEach(k=>delete stockfishEvidenceById[k]);
 Object.assign(stockfishEvidenceById,next);
 renderStockfishEvidence();
 if(sequenceMode==='3'&&!sequenceRun)resetQueue();
 return records.length;
}
$('stockfishBundle').addEventListener('change',async function(){
 const file=this.files&&this.files[0];if(!file)return;
 const notice=$('stockfishImportNotice');
 try{
  if(file.size>3*1024*1024)throw Error('Arquivo maior que 3 MB.');
  const bundle=JSON.parse(await file.text());
  const count=applyStockfishBundle(bundle);
  stockfishManualOverride=true;
  notice.textContent=count+' análises experimentais carregadas manualmente nesta sessão. Nenhum diagnóstico certificado.';
 }catch(error){notice.textContent='Pacote manual não aplicado: '+error.message;}
 this.value='';
});
async function loadStockfishAutomatically(){
 const notice=$('stockfishImportNotice');
 if(typeof window.fetch!=='function'){notice.textContent='Carregamento automático indisponível neste ambiente; use o arquivo manual.';return;}
 notice.textContent='Carregando 240 análises Stockfish públicas e experimentais...';
 try{
  const response=await window.fetch('./stockfish-240-public.json',{cache:'no-cache',credentials:'omit'});
  if(!response||!response.ok)throw Error('Arquivo público indisponível (HTTP '+(response&&response.status||'?')+')');
  const bundle=await response.json();
  if(stockfishManualOverride)return;
  const count=applyStockfishBundle(bundle);
  notice.textContent=count+' análises Stockfish carregadas automaticamente. Dados experimentais, sem diagnóstico certificado.';
 }catch(error){
  if(!stockfishManualOverride)notice.textContent='Análises automáticas indisponíveis: '+error.message+' Selecione o JSON manualmente.';
 }
}
loadStockfishAutomatically();
