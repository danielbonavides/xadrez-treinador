// Gera somente a preview; index.html da v1.2 permanece byte a byte.
const fs=require('node:fs'),crypto=require('node:crypto');
const baseline=fs.readFileSync('index.html','utf8');
const data=JSON.parse(baseline.match(/const DATA=(.*);\r?\n/)[1]);
const revisions=Object.fromEntries(data.puzzles.map(p=>[p.id,crypto.createHash('sha256').update(p.id+'\n'+p.fen+'\n'+p.melhor_uci).digest('hex')]));
fs.writeFileSync('adaptive/revisions.js','const CATALOG_REVISIONS='+JSON.stringify(revisions,null,2)+';\n');
// O mapa de ligação legado fica fixado na base auditada, não em futuros catálogos.
if(!fs.existsSync('adaptive/legacy-revisions.js'))fs.writeFileSync('adaptive/legacy-revisions.js','const LEGACY_REVISIONS='+JSON.stringify(revisions,null,2)+';\n');
let html=baseline.replace(/v1\.2\.0/gi,'v1.4 · preview').replace('V1.2.0','V1.4 · PREVIEW');
html=html.replace('<script>const DATA=', '<script src="../adaptive/stockfish-f5.js"></script><script src="../adaptive/sequence-3.js"></script><script src="../adaptive/core.js"></script><script src="../adaptive/revisions.js"></script><script src="../adaptive/legacy-revisions.js"></script>\n<script>const DATA=');
html=html.replace("const THEME_KEY='xadrez_web_theme_v1'","const THEME_KEY='xadrez_web_test_v1_4_theme'").replace("const AUDIO_KEY='xadrez_web_sound_enabled_v1'","const AUDIO_KEY='xadrez_web_test_v1_4_sound'");
html=html.replace('<section id="trainer" class="tab">','<section id="trainer" class="tab">'+fs.readFileSync('adaptive/controls.html','utf8'));
const start=html.indexOf('let lastMove=null;'),end=html.indexOf('function gameFilter(p)');
html=html.slice(0,start)+fs.readFileSync('adaptive/integration.js','utf8')+'\n'+html.slice(end);
const qStart=html.indexOf('function resetQueue()'),qEnd=html.indexOf('// Render a partir');
html=html.slice(0,qStart)+fs.readFileSync('adaptive/trainer.js','utf8')+'\n'+html.slice(qEnd);
const aStart=html.indexOf(' attempts.push({'),aEnd=html.indexOf(" $('feedback').className='feedback '+",aStart);
html=html.slice(0,aStart)+` const event={event_id:newEventId(),timestamp_utc:new Date().toISOString(),id:current.id,ply:current.ply,uci_tentado:uci,uci_sugerido_g5:current.melhor_uci,acertou:correct,modalidade:current.modalidade,perda_cp_bruta:current.perda_cp,record_schema_version:'xadrez.attempt.v1.4',catalog_revision:CATALOG_REVISIONS[current.id],training_mode:prefs.default_mode,policy_version:Adaptive.POLICY};
 const persisted=recorder.append(event);attempts=recorder.records;renderAdaptive();
`+html.slice(aEnd);
html=html.replace(/ \$\('show'\).disabled=true;\r?\n drawBoard\(\);/, " $('show').disabled=true;\n if(!persisted.saved)$('feedback').append(document.createTextNode(' Atenção: tentativa NÃO SALVA. Exporte o backup ou tente salvar novamente.'));\n drawBoard();");
// Sequence3 preview-only hooks
html=html.replace('function commitLegalMove(move){',"function commitLegalMove(move){\n if(sequenceMode==='3')return commitSequenceMove(move);");
html=html.replace('visibleState=current?R88.parse(current.fen):null;lastMove=null;', "visibleState=current?R88.parse(current.fen):null;lastMove=null;\n if(sequenceMode==='3'&&current){const plan=sequencePlan(current);sequenceRun=plan.status==='ready'?Sequence3.begin(current,plan,R88):null;}renderSequenceStatus();");
html=html.replace("$('show').addEventListener('click',()=>{\n if(!current||result)return;", "$('show').addEventListener('click',()=>{\n if(!current||result)return;\n if(sequenceMode==='3'){if(!sequenceRun||sequenceRun.status!=='playing')return;sequenceRun.hints++;$('feedback').className='feedback';$('feedback').textContent='Dica da variante (não registra tentativa): '+Sequence3.hint(sequenceRun)+'. Escolha seu lance para continuar.';return;}");
const ex=html.indexOf("$('export').addEventListener");
html=html.slice(0,ex)+`$('export').addEventListener('click',()=>downloadBackup(recorder.backup(prefs)));
renderAdaptive();
</script></body></html>\n`;
html=html.replace('Qual lance a engine sugeriu?','Qual lance o G5 sugeriu?');
html=html.replace('Posição ${counter} de ${queue.length}. Tentativas registradas: ${attempts.length}.','Posição ${counter}. Tentativas persistidas: ${attempts.length}.');
fs.mkdirSync('teste-v1.4',{recursive:true});fs.writeFileSync('teste-v1.4/index.html',html);
console.log('Preview gerada: teste-v1.4/index.html; '+data.puzzles.length+' revisões SHA-256.');
