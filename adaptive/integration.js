const ATTEMPTS_KEY='xadrez_v1_attempts_test_v1_4';
const PREFS_KEY='xadrez_v1_4_preferences_test_v1';
// O getter de localStorage também pode lançar SecurityError.
const storage={getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)};
const recorder=new Adaptive.AttemptRecorder(storage,ATTEMPTS_KEY);
const catalog=Adaptive.ExerciseCatalog(DATA.puzzles,CATALOG_REVISIONS,(fen,uci)=>legalUciForFen(fen).includes(uci));
let prefs=Adaptive.preferences(null);
try{prefs=Adaptive.preferences(JSON.parse(storage.getItem(PREFS_KEY)));}catch(e){$('preferenceNotice').textContent='Preferências indisponíveis; usando padrão.';}
let lastMove=null,current=null,sel=null,result=null,visibleState=null,pendingPromotion=null,attempts=recorder.records,counter=0,queue=[],used=new Set();
let projections=[],queueReady=false;
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
function downloadBackup(out){const b=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='XADREZ_TREINO_V1_4_TESTE.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
const mergeAttemptHistories=Adaptive.mergeHistories;
$('retrySave').addEventListener('click',()=>{recorder.retry();attempts=recorder.records;renderAdaptive();});
$('importProgress').addEventListener('change',async function(){
 const file=this.files&&this.files[0];if(!file)return;
 try{if(file.size>5*1024*1024)throw Error('Arquivo maior que 5 MB');const incoming=JSON.parse(await file.text()),records=Array.isArray(incoming)?incoming:incoming&&incoming.puzzles_tentados;
 const before=recorder.records.length,merged=mergeAttemptHistories(recorder.pending,records),r=recorder.save(merged);
 if(!r.saved)throw Error(r.error);attempts=recorder.records;$('importNotice').textContent=`Histórico conciliado: ${attempts.length-before} registros adicionados. Preferências atuais preservadas.`;resetQueue();
 }catch(e){$('importNotice').textContent='Importação não aplicada: '+e.message;}this.value='';renderAdaptive();
});
['trainingMode','cadence'].forEach(id=>$(id).addEventListener('change',resetQueue));
$('refreshQueue').addEventListener('click',resetQueue);
window.addEventListener('storage',e=>{if(e.key===ATTEMPTS_KEY){recorder.reload();attempts=recorder.records;queueReady=false;renderAdaptive();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){queueReady=false;renderAdaptive();}});

// F5 experimental: não acoplar ao scheduler nem ao recorder. Sem JSON aprovado, falha fechada.
const stockfishEvidenceById=Object.create(null);
function renderStockfishEvidence(){const n=$('stockfishEvidence');if(!n)return;const raw=current&&stockfishEvidenceById[current.id];const model=current?StockfishF5.normalize(raw,current,observationLegal):null;n.textContent=StockfishF5.render(model);}
