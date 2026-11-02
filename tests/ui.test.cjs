// Integração dos scripts reais da preview em DOM mínimo, sem dependências externas.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('teste-v1.4/index.html','utf8');
function boot(raw='[]',fail=false,fetchMock=null,audioCtor=null){
 const writes=[],items=new Map([['xadrez_v1_attempts','PRODUCTION_SENTINEL'],['xadrez_v1_attempts_test_v1_4',raw]]),elements=new Map();
 function el(id){if(!elements.has(id)){const classes=new Set(id==='trainer'?['active']:[]);elements.set(id,{id,value:'ALL',textContent:'',innerHTML:'',style:{},dataset:{},disabled:false,handlers:{},classList:{contains:c=>classes.has(c),toggle(c,v){v===undefined?v=!classes.has(c):v;v?classes.add(c):classes.delete(c);}},addEventListener(type,fn){this.handlers[type]=fn;},setAttribute(){},querySelectorAll(){return[];},append(node){this.textContent+=node.textContent;},click(){return this.handlers.click&&this.handlers.click({target:this});}});}return elements.get(id);}
 const storage={getItem:k=>items.has(k)?items.get(k):null,setItem(k,v){if(fail)throw Error('QuotaExceededError');writes.push(k);items.set(k,v);}};
 const document={body:{dataset:{}},getElementById:el,querySelectorAll:()=>[],addEventListener(){},createTextNode:text=>({textContent:text}),createElement:()=>({click(){}})};
 const context=vm.createContext({document,localStorage:storage,window:{localStorage:storage,addEventListener(){},fetch:fetchMock,AudioContext:audioCtor,crypto:require('node:crypto').webcrypto},console,URL,Blob,setTimeout});
 for(const file of ['stockfish-f5.js','sequence-3.js','board-toc.js','core.js','revisions.js','legacy-revisions.js'])vm.runInContext(fs.readFileSync('adaptive/'+file,'utf8'),context);
 vm.runInContext(html.match(/<script>const DATA=([\s\S]*?)<\/script>/)[0].slice(8,-9),context);
 const run=code=>vm.runInContext(code,context);
 return {el,run,writes,items,setFailure:value=>fail=value};
}
test('UI boot/start/suggestion/theme/audio never create attempts or touch production',()=>{const b=boot();b.run('startPuzzle()');assert.equal(b.el('board').innerHTML.match(/data-square=/g).length,64);b.el('show').click();assert.equal(b.run('attempts.length'),0);b.el('boardTheme').handlers.change({target:{value:'classic'}});b.el('audioToggle').click();assert.equal(b.run('attempts.length'),0);assert.equal(b.items.get('xadrez_v1_attempts'),'PRODUCTION_SENTINEL');assert(b.writes.every(k=>k.includes('_test_')));});
test('UI legal commit persists compatible event and updates scheduling; refresh retains it',()=>{const b=boot();b.run('startPuzzle();commitLegalMove(R88.legal(visibleState).find(m=>R88.uci(m)===current.melhor_uci))');assert.equal(b.run('attempts.length'),1);assert.match(b.el('reviewStatus').textContent,/24 h/);const raw=b.items.get('xadrez_v1_attempts_test_v1_4'),a=JSON.parse(raw)[0];assert.equal(a.acertou,true);assert.equal(a.record_schema_version,'xadrez.attempt.v1.4');assert.equal(a.training_mode,'misto');assert.match(a.catalog_revision,/^[a-f0-9]{64}$/);assert.equal(boot(raw).run('attempts.length'),1);});
test('UI quota shows unsaved warning and retains downloadable fallback',()=>{const b=boot('[]',true);b.run('startPuzzle();commitLegalMove(R88.legal(visibleState)[0])');assert.equal(b.run('attempts.length'),0);assert.equal(b.run('recorder.pending.length'),1);assert.match(b.el('storageStatus').textContent,/NÃO SALVA/);assert.match(b.el('feedback').textContent,/NÃO SALVA/);assert.equal(b.run('recorder.backup(prefs).puzzles_tentados.length'),1);b.setFailure(false);b.el('retrySave').click();assert.equal(b.run('attempts.length'),1);assert.equal(b.run('recorder.pending.length'),0);});
test('UI illegal move, empty queue and mode changes do not record',()=>{const b=boot();b.run("startPuzzle();playSquare('e2');playSquare('e7')");assert.equal(b.run('attempts.length'),0);b.el('trainingMode').value='revisao';b.el('trainingMode').handlers.change();assert.match(b.el('feedback').textContent,/Fila concluída/);assert.equal(b.run('current'),null);assert.equal(b.el('show').disabled,true);assert.equal(b.run('attempts.length'),0);});
test('UI import replay is idempotent, preferences stay current',async()=>{const b=boot(),a=b.run("({id:current?.id||'EX0001',ply:11,uci_tentado:'e2e4',uci_sugerido_g5:'e2e4',acertou:true})");const file={size:100,text:async()=>JSON.stringify({puzzles_tentados:[a,a],adaptive:{preferences:{default_mode:'revisao'}}})};for(let i=0;i<2;i++){b.el('importProgress').files=[file];await b.el('importProgress').handlers.change.call(b.el('importProgress'));}assert.equal(b.run('attempts.length'),2);assert.equal(b.run('prefs.default_mode'),'misto');assert.equal(b.run('projections[0].due_at_utc'),null);});

test('F5 automatically loads 240 public records without history writes',async()=>{
 const json=JSON.parse(fs.readFileSync('teste-v1.4/stockfish-240-public.json','utf8'));let hits=0;
 const b=boot('[]',false,async(url,opts)=>{hits++;assert.equal(url,'./stockfish-240-public.json');assert.equal(opts.credentials,'omit');return {ok:true,status:200,json:async()=>json};});
 b.run('startPuzzle()');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(hits,1);
 assert.equal(b.run('Object.keys(stockfishEvidenceById).length'),240);
 assert.match(b.el('stockfishImportNotice').textContent,/240 análises Stockfish carregadas automaticamente/);
 assert.match(b.el('stockfishEvidence').textContent,/NÃO certifica erro/);
 assert.equal(b.items.get('xadrez_v1_attempts'),'PRODUCTION_SENTINEL');
 assert.equal(b.run('attempts.length'),0);
});
test('F5 fetch failure retains manual fallback and does not touch training',async()=>{
 const b=boot('[]',false,async()=>({ok:false,status:404}));
 b.run('startPuzzle()');
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(b.el('stockfishImportNotice').textContent,/Selecione o JSON manualmente/);
 assert.equal(b.run('attempts.length'),0);
 assert.equal(b.run('Object.keys(stockfishEvidenceById).length'),0);
});

test('sequence3: 3 player moves + 2 scripted replies, separate persistence, no G5 schedule',async()=>{
 const dataset=JSON.parse(fs.readFileSync('teste-v1.4/stockfish-240-public.json','utf8'));
 const b=boot('[]',false,async()=>({ok:true,json:async()=>dataset}));
 await new Promise(resolve=>setImmediate(resolve));
 b.el('exerciseLength').value='3';b.el('exerciseLength').handlers.change();
 assert.equal(b.run('sequenceRun.status'),'playing');
 assert.equal(b.run('sequenceRun.player_moves.length'),0);
 const historyBefore=b.items.get('xadrez_v1_attempts_test_v1_4');
 b.el('show').click();
 assert.equal(b.run('sequenceRun.hints'),1);assert.equal(b.run('sequenceRun.player_moves.length'),0);
 for(let i=1;i<=3;i++){
  b.run('commitLegalMove(R88.legal(visibleState).find(m=>R88.uci(m)===Sequence3.hint(sequenceRun)))');
  assert.equal(b.run('sequenceRun.player_moves.length'),i);
  if(i<3)assert.equal(b.run('sequenceRun.opponent_moves.length'),i);
 }
 assert.equal(b.run('sequenceRun.status'),'complete');
 assert.equal(b.run('sequenceRecorder.records.length'),1);
 assert.equal(b.run('attempts.length'),0);
 assert.equal(b.items.get('xadrez_v1_attempts_test_v1_4'),historyBefore);
 assert.equal(b.items.get('xadrez_v1_attempts'),'PRODUCTION_SENTINEL');
 const stored=JSON.parse(b.items.get('xadrez_v1_4_sequences_test_v1'))[0];
 assert.equal(stored.sequence_status,'complete');
 assert.equal(stored.hints_used,1);
 assert.equal(stored.player_moves.length,3);
 assert.equal(stored.opponent_moves.length,2);
});
test('sequence3 legal alternative ends as deviation without classifying error',async()=>{
 const data=JSON.parse(fs.readFileSync('teste-v1.4/stockfish-240-public.json','utf8'));
 const b=boot('[]',false,async()=>({ok:true,json:async()=>data}));
 await new Promise(resolve=>setImmediate(resolve));
 b.el('exerciseLength').value='3';b.el('exerciseLength').handlers.change();
 b.run('commitLegalMove(R88.legal(visibleState).find(m=>R88.uci(m)!==Sequence3.hint(sequenceRun)))');
 assert.equal(b.run('sequenceRun.status'),'deviation');
 assert.equal(b.run('sequenceRecorder.records.length'),1);
 assert.match(b.el('feedback').textContent,/NÃO é necessariamente um erro/);
 assert.equal(b.run('attempts.length'),0);
});

test('toque da jogada certa é diferente de movimento comum e controle liga/desliga',()=>{
 const fakeAudio=function(){this.state='running';this.currentTime=0};
 const b=boot('[]',false,null,fakeAudio);
 b.run('globalThis.__audioEvents=[];BoardToc.play=(_,kind)=>{__audioEvents.push(kind);return true;}');
 assert.equal(b.run('audioEnabled'),false);
 b.el('audioToggle').click();
 assert.equal(b.run('audioEnabled'),true);
 assert.equal(b.run('__audioEvents[0]'),'move');
 b.run('startPuzzle();commitLegalMove(R88.legal(visibleState).find(m=>R88.uci(m)===current.melhor_uci))');
 assert.equal(b.run('__audioEvents[1]'),'correct');
 assert.equal(b.run('attempts.length'),1);
 b.el('audioToggle').click();
 assert.equal(b.run('audioEnabled'),false);
 assert.equal(b.run('__audioEvents.length'),2);
 assert.equal(b.items.get('xadrez_v1_attempts'),'PRODUCTION_SENTINEL');
 assert(b.writes.every(k=>k.includes('_test_')));
});
test('toque no modo três lances identifica acerto sem alterar histórico G5',async()=>{
 const dataset=JSON.parse(fs.readFileSync('teste-v1.4/stockfish-240-public.json','utf8'));
 const fakeAudio=function(){this.state='running';this.currentTime=0};
 const b=boot('[]',false,async()=>({ok:true,json:async()=>dataset}),fakeAudio);
 b.run('globalThis.__audioEvents=[];BoardToc.play=(_,kind)=>{__audioEvents.push(kind);return true;}');
 await new Promise(resolve=>setImmediate(resolve));
 b.el('exerciseLength').value='3';b.el('exerciseLength').handlers.change();
 b.el('audioToggle').click();
 b.run('commitLegalMove(R88.legal(visibleState).find(m=>R88.uci(m)===Sequence3.hint(sequenceRun)))');
 assert.equal(b.run('sequenceRun.player_moves.length'),1);
 assert.equal(b.run('__audioEvents[1]'),'check'); // o primeiro lance dessa variante dá xeque; prioridade sobre acerto.
 assert.equal(b.run('attempts.length'),0);
});
