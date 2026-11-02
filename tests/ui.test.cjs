// Integração dos scripts reais da preview em DOM mínimo, sem dependências externas.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('teste-v1.4/index.html','utf8');
function boot(raw='[]',fail=false){
 const writes=[],items=new Map([['xadrez_v1_attempts','PRODUCTION_SENTINEL'],['xadrez_v1_attempts_test_v1_4',raw]]),elements=new Map();
 function el(id){if(!elements.has(id)){const classes=new Set(id==='trainer'?['active']:[]);elements.set(id,{id,value:'ALL',textContent:'',innerHTML:'',style:{},dataset:{},disabled:false,handlers:{},classList:{contains:c=>classes.has(c),toggle(c,v){v===undefined?v=!classes.has(c):v;v?classes.add(c):classes.delete(c);}},addEventListener(type,fn){this.handlers[type]=fn;},setAttribute(){},querySelectorAll(){return[];},append(node){this.textContent+=node.textContent;},click(){return this.handlers.click&&this.handlers.click({target:this});}});}return elements.get(id);}
 const storage={getItem:k=>items.has(k)?items.get(k):null,setItem(k,v){if(fail)throw Error('QuotaExceededError');writes.push(k);items.set(k,v);}};
 const document={body:{dataset:{}},getElementById:el,querySelectorAll:()=>[],addEventListener(){},createTextNode:text=>({textContent:text}),createElement:()=>({click(){}})};
 const context=vm.createContext({document,localStorage:storage,window:{localStorage:storage,addEventListener(){},crypto:require('node:crypto').webcrypto},console,URL,Blob,setTimeout});
 vm.runInContext(fs.readFileSync('stockfish-240/adapter.js','utf8'),context);
 for(const file of ['core.js','revisions.js','legacy-revisions.js'])vm.runInContext(fs.readFileSync('adaptive/'+file,'utf8'),context);
 vm.runInContext(html.match(/<script>const DATA=([\s\S]*?)<\/script>/)[0].slice(8,-9),context);
 const run=code=>vm.runInContext(code,context);
 return {el,run,writes,items,setFailure:value=>fail=value};
}
test('UI boot/start/suggestion/theme/audio never create attempts or touch production',()=>{const b=boot();b.run('startPuzzle()');assert.equal(b.el('board').innerHTML.match(/data-square=/g).length,64);b.el('show').click();assert.equal(b.run('attempts.length'),0);b.el('boardTheme').handlers.change({target:{value:'classic'}});b.el('audioToggle').click();assert.equal(b.run('attempts.length'),0);assert.equal(b.items.get('xadrez_v1_attempts'),'PRODUCTION_SENTINEL');assert(b.writes.every(k=>k.includes('_test_')));});
test('UI legal commit persists compatible event and updates scheduling; refresh retains it',()=>{const b=boot();b.run('startPuzzle();commitLegalMove(R88.legal(visibleState).find(m=>R88.uci(m)===current.melhor_uci))');assert.equal(b.run('attempts.length'),1);assert.match(b.el('reviewStatus').textContent,/24 h/);const raw=b.items.get('xadrez_v1_attempts_test_v1_4'),a=JSON.parse(raw)[0];assert.equal(a.acertou,true);assert.equal(a.record_schema_version,'xadrez.attempt.v1.4');assert.equal(a.training_mode,'misto');assert.match(a.catalog_revision,/^[a-f0-9]{64}$/);assert.equal(boot(raw).run('attempts.length'),1);});
test('UI quota shows unsaved warning and retains downloadable fallback',()=>{const b=boot('[]',true);b.run('startPuzzle();commitLegalMove(R88.legal(visibleState)[0])');assert.equal(b.run('attempts.length'),0);assert.equal(b.run('recorder.pending.length'),1);assert.match(b.el('storageStatus').textContent,/NÃO SALVA/);assert.match(b.el('feedback').textContent,/NÃO SALVA/);assert.equal(b.run('recorder.backup(prefs).puzzles_tentados.length'),1);b.setFailure(false);b.el('retrySave').click();assert.equal(b.run('attempts.length'),1);assert.equal(b.run('recorder.pending.length'),0);});
test('UI illegal move, empty queue and mode changes do not record',()=>{const b=boot();b.run("startPuzzle();playSquare('e2');playSquare('e7')");assert.equal(b.run('attempts.length'),0);b.el('trainingMode').value='revisao';b.el('trainingMode').handlers.change();assert.match(b.el('feedback').textContent,/Fila concluída/);assert.equal(b.run('current'),null);assert.equal(b.el('show').disabled,true);assert.equal(b.run('attempts.length'),0);});
test('UI import replay is idempotent, preferences stay current',async()=>{const b=boot(),a=b.run("({id:current?.id||'EX0001',ply:11,uci_tentado:'e2e4',uci_sugerido_g5:'e2e4',acertou:true})");const file={size:100,text:async()=>JSON.stringify({puzzles_tentados:[a,a],adaptive:{preferences:{default_mode:'revisao'}}})};for(let i=0;i<2;i++){b.el('importProgress').files=[file];await b.el('importProgress').handlers.change.call(b.el('importProgress'));}assert.equal(b.run('attempts.length'),2);assert.equal(b.run('prefs.default_mode'),'misto');assert.equal(b.run('projections[0].due_at_utc'),null);});

test('UI Stockfish 240 import validates real PVs and does not change attempts or scheduling',async()=>{
 const b=boot();b.run('startPuzzle()');
 const raw=fs.readFileSync('stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json','utf8');
 const file={size:Buffer.byteLength(raw),text:async()=>raw};
 b.el('stockfishBundle').files=[file];await b.el('stockfishBundle').handlers.change.call(b.el('stockfishBundle'));
 assert.equal(b.run('stockfishPedagogy.stats.valid'),240);
 assert.equal(b.run('stockfishPedagogy.stats.divergences'),68);
 assert.match(b.el('stockfishImportNotice').textContent,/240\/240/);
 assert.match(b.el('stockfishEvidence').textContent,/Sugestão histórica G5/);
 assert.equal(b.run('attempts.length'),0);
 assert.equal(b.items.get('xadrez_v1_attempts'),'PRODUCTION_SENTINEL');
 assert.deepEqual(b.writes,[]);
});
test('UI partial evidence disables only its exercise; other puzzles retain the panel',async()=>{
 const b=boot();b.run('startPuzzle()');
 const bundle=JSON.parse(fs.readFileSync('stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json','utf8'));
 bundle.puzzles=bundle.puzzles.filter(p=>p.exercise_id!=='EX0001');
 const raw=JSON.stringify(bundle),file={size:Buffer.byteLength(raw),text:async()=>raw};
 b.el('stockfishBundle').files=[file];await b.el('stockfishBundle').handlers.change.call(b.el('stockfishBundle'));
 assert.equal(b.run('stockfishPedagogy.stats.valid'),239);
 assert.match(b.el('stockfishImportNotice').textContent,/239\/240/);
 assert.match(b.el('stockfishEvidence').textContent,/EX0001.*ID_INEXISTENTE/);
 b.el('next').click();
 assert.match(b.el('stockfishEvidence').textContent,/Sugestão histórica G5/);
 assert.equal(b.run('attempts.length'),0);
 assert.deepEqual(b.writes,[]);
});
test('UI malformed Stockfish JSON is rejected without affecting active G5 exercise',async()=>{
 const b=boot();b.run('startPuzzle()');const current=b.run('current.id');
 const file={size:10,text:async()=>'{bad'};
 b.el('stockfishBundle').files=[file];await b.el('stockfishBundle').handlers.change.call(b.el('stockfishBundle'));
 assert.match(b.el('stockfishImportNotice').textContent,/Pacote não aplicado/);
 assert.equal(b.run('current.id'),current);assert.equal(b.run('attempts.length'),0);
});

test('UI Stockfish panel can be disabled mid-session without changing scheduler or history',async()=>{
 const b=boot();b.run('startPuzzle()');
 const raw=fs.readFileSync('stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json','utf8');
 const file={size:Buffer.byteLength(raw),text:async()=>raw};
 b.el('stockfishBundle').files=[file];await b.el('stockfishBundle').handlers.change.call(b.el('stockfishBundle'));
 const current=b.run('current.id'),schedule=JSON.stringify(b.run('projections'));
 assert.equal(b.run('stockfishPedagogy.stats.valid'),240);
 b.el('stockfishDisable').click();
 assert.equal(b.run('stockfishPedagogy'),null);assert.equal(b.run('stockfishDisabled'),true);
 assert.match(b.el('stockfishEvidence').textContent,/desligada nesta sessão/);
 assert.equal(b.run('current.id'),current);assert.equal(JSON.stringify(b.run('projections')),schedule);
 assert.equal(b.run('attempts.length'),0);assert.deepEqual(b.writes,[]);
});
