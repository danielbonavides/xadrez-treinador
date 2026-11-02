(function(root){
'use strict';
const POLICY='adaptive.v0.1', HOURS=[24,72,168,336,720];
const MODES=['novos','revisao','misto'];
const UCI=/^[a-h][1-8][a-h][1-8][qrbn]?$/;
const DEFAULTS={schema_version:'xadrez.preferences.v1',default_mode:'misto',new_to_review_ratio:[1,2],filters:{modalidade:'ALL',fase:'ALL',cor:'ALL'},policy_version:POLICY};
const canonical=value=>value&&typeof value==='object'?(Array.isArray(value)?value.map(canonical):Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,canonical(value[k])]))):value;
const stable=value=>JSON.stringify(canonical(value));
const legacyKey=a=>JSON.stringify([a.id,a.ply,a.uci_tentado,a.uci_sugerido_g5,a.modalidade,a.perda_cp_bruta,a.acertou]);
function preferences(input){
 const p=JSON.parse(JSON.stringify(DEFAULTS));
 if(!input||typeof input!=='object')return p;
 if(MODES.includes(input.default_mode))p.default_mode=input.default_mode;
 if(Array.isArray(input.new_to_review_ratio)&&input.new_to_review_ratio.length===2&&input.new_to_review_ratio.every(n=>Number.isInteger(n)&&n>=1&&n<=10))p.new_to_review_ratio=input.new_to_review_ratio.slice();
 const allowed={modalidade:['ALL','Live','Daily'],fase:['ALL','ABERTURA','MEIO_JOGO','FINAL'],cor:['ALL','Brancas','Pretas']};
 for(const k of Object.keys(allowed))if(input.filters&&allowed[k].includes(input.filters[k]))p.filters[k]=input.filters[k];
 return p;
}
function ExerciseCatalog(puzzles,revisions,isLegal){
 const seen=new Set();
 return puzzles.map(p=>{
  if(seen.has(p.id)||!/^EX\d{4}$/.test(p.id)||!p.fen||!UCI.test(p.melhor_uci)||!isLegal(p.fen,p.melhor_uci)||!revisions[p.id]||!/^[a-f0-9]{64}$/.test(revisions[p.id]))throw Error('Catálogo inválido: '+p.id);
  seen.add(p.id);
  return Object.freeze({schema_version:'xadrez.exercise.v1',exercise_id:p.id,catalog_revision:revisions[p.id],fen_before:p.fen,suggested_uci_g5:p.melhor_uci,suggestion_status:'exploratory',modality:p.modalidade,phase:p.fase,color:p.cor,ply:p.ply});
 });
}
// A associação sem fingerprint fica limitada à revisão v1.2 auditada no build.
function LegacyAttemptAdapter(records,catalog,nowUtc,isLegal,legacyRevisions){
 const now=Date.parse(nowUtc);if(!Number.isFinite(now))throw Error('Relógio UTC inválido');
 const refs=new Map(catalog.map(e=>[e.exercise_id,e]));
 const identities=new Map(),conflicts=new Set(),seen=new Set();
 for(const a of records){if(a&&typeof a.event_id==='string'&&a.event_id){const key=stable(a);if(identities.has(a.event_id)&&identities.get(a.event_id)!==key)conflicts.add(a.event_id);identities.set(a.event_id,key);}}
 return records.map((raw,index)=>{
  const a=raw&&typeof raw==='object'?raw:{},ref=refs.get(a.id);
  let reason=null,duplicate=false,observation='unknown',timestamp=null;
  if(a.event_id&&seen.has(a.event_id))duplicate=true;
  if(a.event_id)seen.add(a.event_id);
  if(conflicts.has(a.event_id))reason='event_id_conflict';
  else if(!ref)reason='unknown_exercise';
  else if(a.catalog_revision? a.catalog_revision!==ref.catalog_revision : legacyRevisions[a.id]!==ref.catalog_revision)reason='other_revision';
  else if(a.ply!==ref.ply||a.uci_sugerido_g5!==ref.suggested_uci_g5||!UCI.test(a.uci_tentado)||typeof a.acertou!=='boolean')reason='incomplete_or_incompatible';
  else if(a.acertou!==(a.uci_tentado===ref.suggested_uci_g5)||!isLegal(ref.fen_before,a.uci_tentado))reason='invalid_observation';
  else observation=a.acertou?'matched_g5':'alternative_legal';
  if(!reason&&a.timestamp_utc!=null){
   // Exige UTC explícito e data real; Date.parse isolado normaliza dias impossíveis.
   if(typeof a.timestamp_utc!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(a.timestamp_utc)||!Number.isFinite(Date.parse(a.timestamp_utc)))reason='invalid_time';
   else {timestamp=Date.parse(a.timestamp_utc);if(new Date(timestamp).toISOString().replace('.000Z','Z')!==a.timestamp_utc.replace('.000Z','Z'))reason='invalid_time';else if(timestamp>now)reason='future_time';}
  }
  return {raw,index,exercise_id:a.id,observation,timestamp,reason,duplicate};
 });
}
function AdaptiveScheduler(catalog,events,nowUtc){
 const now=Date.parse(nowUtc);if(!Number.isFinite(now))throw Error('Relógio UTC inválido');
 return catalog.map(ref=>{
  const all=events.filter(a=>a.exercise_id===ref.exercise_id&&!a.duplicate),valid=all.filter(a=>!a.reason&&a.observation!=='unknown');
  const timed=valid.filter(a=>a.timestamp!==null).sort((a,b)=>a.timestamp-b.timestamp||a.index-b.index);
  let streak=0,due=null,last=null;
  for(const a of timed){streak=a.observation==='matched_g5'?streak+1:0;due=a.timestamp+(streak?HOURS[Math.min(streak,5)-1]*3600000:900000);last=a;}
  const legacy=valid.filter(a=>a.timestamp===null).length;
  return {...ref,schema_version:'xadrez.review.v1',status:due!==null?(due<=now?'due':'scheduled'):legacy?'legacy_without_schedule':all.length?'quarantined':'new',streak:timed.length?streak:null,last_observation:last?last.observation:null,last_attempt_utc:last?new Date(last.timestamp).toISOString():null,due_at_utc:due===null?null:new Date(due).toISOString(),policy_version:POLICY,time_eligible_events:timed.length,legacy_events_without_time:legacy,historical_events:valid.length,matched_g5:valid.filter(a=>a.observation==='matched_g5').length,alternative_legal:valid.filter(a=>a.observation==='alternative_legal').length,quarantined_events:all.filter(a=>a.reason).length,reviews_performed:Math.max(0,timed.length-1)};
 });
}
function QueueBuilder(projections,prefs){
 const p=preferences(prefs),f=p.filters;
 const filtered=projections.filter(e=>(f.modalidade==='ALL'||e.modality===f.modalidade)&&(f.fase==='ALL'||e.phase===f.fase)&&(f.cor==='ALL'||e.color===f.cor));
 const cmp=(a,b)=>(a.exercise_id<b.exercise_id?-1:a.exercise_id>b.exercise_id?1:0);
 const due=filtered.filter(e=>e.status==='due').sort((a,b)=>Date.parse(a.due_at_utc)-Date.parse(b.due_at_utc)||b.alternative_legal-a.alternative_legal||cmp(a,b));
 // Legado sem data continua acessível, mas nunca é chamado de revisão vencida ou acervo não visto.
 const fresh=filtered.filter(e=>e.status==='new'||e.status==='legacy_without_schedule').sort(cmp);
 if(p.default_mode==='novos')return fresh;
 if(p.default_mode==='revisao')return due;
 const out=[];let i=0,j=0;
 while(i<fresh.length||j<due.length){for(let n=0;n<p.new_to_review_ratio[1]&&j<due.length;n++)out.push(due[j++]);for(let n=0;n<p.new_to_review_ratio[0]&&i<fresh.length;n++)out.push(fresh[i++]);}
 return out;
}
function mergeHistories(current,incoming){
 if(!Array.isArray(incoming)||incoming.length>50000||!incoming.every(a=>a&&typeof a==='object'&&!Array.isArray(a)&&typeof a.id==='string'&&a.id.length<80&&UCI.test(a.uci_tentado)))throw Error('Tentativas inválidas no backup');
 const out=current.slice(),ids=new Map(),counts=new Map(),seen=new Map();
 for(const a of current){if(a&&a.event_id)ids.set(a.event_id,stable(a));else if(a&&typeof a==='object'){const k=legacyKey(a);counts.set(k,(counts.get(k)||0)+1);}}
 for(const a of incoming){
  if(a.event_id){if(typeof a.event_id!=='string')throw Error('event_id inválido');if(ids.has(a.event_id)&&ids.get(a.event_id)!==stable(a))throw Error('Conflito de event_id; nenhum registro foi alterado');if(!ids.has(a.event_id)){out.push(a);ids.set(a.event_id,stable(a));}}
  else {const k=legacyKey(a),n=(seen.get(k)||0)+1;seen.set(k,n);if(n>(counts.get(k)||0))out.push(a);}
 }
 return out;
}
class AttemptRecorder{
 constructor(storage,key){this.storage=storage;this.key=key;this.pending=[];this.error=null;this.records=[];this.raw=null;this.reload();}
 reload(){try{this.raw=this.storage.getItem(this.key);const a=JSON.parse(this.raw||'[]');if(!Array.isArray(a))throw Error('Histórico não é array');this.records=a;this.error=null;return true;}catch(e){this.error=e.message;return false;}}
 save(incoming){
  if(!this.reload())return {saved:false,error:this.error};
  try{const merged=mergeHistories(this.records,incoming);if(stable(merged)!==stable(this.records))this.storage.setItem(this.key,JSON.stringify(merged));this.records=merged;this.pending=[];return {saved:true};}catch(e){this.error=e.message;return {saved:false,error:this.error};}
 }
 append(event){const pending=this.pending.concat([event]),r=this.save(pending);if(!r.saved)this.pending=pending;return r;}
 retry(){return this.save(this.pending);}
 backup(prefs){return {versao:'XADREZ-V1',data_exportacao:new Date().toISOString(),puzzles_tentados:this.records.concat(this.pending),adaptive:{schema_version:'xadrez.backup.v1.4',policy_version:POLICY,preferences:preferences(prefs)},unsaved_events:this.pending.length,unreadable_history_raw:this.error?this.raw:null};}
}
function PedagogyAdapter(data){return {available:false,label:'Análise Stockfish (experimental)',explanation:null,status:data?'pending_contract_validation':'not_loaded'};}
const api={POLICY,preferences,ExerciseCatalog,LegacyAttemptAdapter,AdaptiveScheduler,QueueBuilder,AttemptRecorder,mergeHistories,PedagogyAdapter};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Adaptive=api;
})(typeof globalThis!=='undefined'?globalThis:this);
