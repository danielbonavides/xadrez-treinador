function resetQueue(){
 collectPreferences();queueReady=false;current=null;sequenceRun=null;counter=0;used.clear();
 sel=null;result=null;visibleState=null;pendingPromotion=null;lastMove=null;
 renderAdaptive();startPuzzle();
}
function sequencePlan(p){return Sequence3.build(p,stockfishEvidenceById[p.id],R88);}
function renderSequenceStatus(){
 const n=$('sequenceStatus');if(!n)return;
 if(sequenceMode!=='3'){n.textContent='';return;}
 if(!sequenceRun){n.textContent='Modo 3 lances: aguardando variantes verificadas ou exercício disponível.';return;}
 const played=sequenceRun.player_moves.length;
 const labels={playing:'Em andamento',complete:'Sequência completada',deviation:'Desvio legal da variante',invalid_response:'Resposta inválida — execução suspensa'};
 n.textContent='Sequência exploratória · '+(labels[sequenceRun.status]||sequenceRun.status)+' · seus lances '+played+'/3'+(sequenceRun.status==='playing'?' · jogue o lance '+(played+1):'')+'.';
}
function startPuzzle(){
 if(!document.getElementById('trainer').classList.contains('active'))return;
 projections=projectNow();
 const ids=Adaptive.QueueBuilder(projections,prefs).map(p=>p.exercise_id);
 if(!queueReady){used.clear();counter=0;queueReady=true;}
 let next=ids.filter(id=>!used.has(id)).map(id=>DATA.puzzles.find(p=>p.id===id));
 if(sequenceMode==='3')next=next.filter(p=>sequencePlan(p).status==='ready');
 queue=next;
 current=queue[0]||null;sequenceRun=null;sel=null;result=null;pendingPromotion=null;lastMove=null;visibleState=null;
 togglePromotionUi();$('moveArrow').innerHTML='';
 if(!current){
  renderStockfishEvidence();renderSequenceStatus();$('feedback').className='feedback';
  $('feedback').textContent=sequenceMode==='3'?'Fila de três lances vazia. Verifique se as análises Stockfish terminaram de carregar; apenas 227 variantes possuem cinco meios-lances ou mais. Selecione 1 lance para todo o catálogo.':'Fila concluída ou sem posições disponíveis neste modo e filtro. Altere o modo ou atualize a fila quando houver revisões vencidas.';
  $('board').innerHTML='';$('puzzleMeta').textContent='FILA VAZIA';$('puzzleTitle').textContent='Treino em dia';$('puzzleInfo').textContent='';$('progressText').textContent='Nenhuma tentativa criada.';$('progressBar').style.width='100%';$('show').disabled=true;renderAdaptive();return;
 }
 used.add(current.id);counter++;
 if(sequenceMode==='3'){
  const plan=sequencePlan(current);
  sequenceRun=Sequence3.begin(current,plan,R88);
  visibleState=sequenceRun.board;
 }else visibleState=R88.parse(current.fen);
 drawBoard();renderStockfishEvidence();renderSequenceStatus();
 $('feedback').className='feedback';$('feedback').textContent=sequenceMode==='3'?'Seu lance 1/3. As duas respostas adversárias serão aplicadas conforme a variante G5/Stockfish, sem motor ao vivo.':'Sua vez. Selecione a origem e o destino do lance sugerido.';
 $('puzzleMeta').textContent=`${current.modalidade} · ${pretty[current.fase]||current.fase} · ${current.cor}`;
 $('puzzleTitle').textContent=sequenceMode==='3'?'Encontre os 3 lances da sequência':'Qual lance o G5 sugeriu?';
 $('puzzleInfo').textContent=`Exercício ${current.id} · Lance ${Math.ceil(current.ply/2)}`;
 $('progressText').textContent=`Posição ${counter}. ${queue.length-1} restantes na fila. Tentativas G5 persistidas: ${attempts.length}.`;
 $('progressBar').style.width=Math.round(counter/(counter+queue.length-1)*100)+'%';$('show').disabled=false;renderAdaptive();
}
function commitSequenceMove(move){
 if(!sequenceRun||sequenceRun.status!=='playing')return;
 const uci=R88.uci(move);
 const before=visibleState;
 const expected=Sequence3.hint(sequenceRun);
 const wasCapture=before.b[move[1]]!=='.'||move[3]==='ep';
 const advanced=Sequence3.play(sequenceRun,uci,R88);
 if(advanced.status==='illegal')return;
 // O som do jogador considera o tabuleiro após o SEU lance, não após a resposta automática.
 const humanAfter=R88.apply(before,move);
 const lastReply=advanced.automatic_reply;
 sequenceRun=advanced;
 visibleState=advanced.board;
 lastMove=lastReply?{from:lastReply.slice(0,2),to:lastReply.slice(2,4)}:{from:uci.slice(0,2),to:uci.slice(2,4)};
 playMoveSound(BoardToc.classify({check:R88.checked(humanAfter),capture:wasCapture,correct:uci===expected,castle:move[3]==='castle',promotion:!!move[2]}));
 if(lastReply&&audioEnabled){
  // Resposta adversária recebe um toque neutro, ligeiramente depois do lance do jogador.
  const reply=R88.legal(humanAfter).find(m=>R88.uci(m)===lastReply);
  if(reply){
   const replyAfter=R88.apply(humanAfter,reply);
   const replyKind=BoardToc.classify({check:R88.checked(replyAfter),capture:humanAfter.b[reply[1]]!=='.'||reply[3]==='ep',castle:reply[3]==='castle',promotion:!!reply[2]});
   const exerciseId=current.id;
   setTimeout(()=>{if(audioEnabled&&current&&current.id===exerciseId)playMoveSound(replyKind);},135);
  }
 }
 sel=null;pendingPromotion=null;togglePromotionUi();
 if(advanced.status==='playing'){
  result=null;
  $('feedback').className='feedback correct';
  $('feedback').textContent=`Lance ${advanced.player_moves.length}/3 registrado na sequência. Resposta automática da variante: ${lastReply}. Agora é sua vez novamente. Esta sequência é exploratória.`;
  $('show').disabled=false;
 }else{
  result=R88.square(move[1]);
  const event={
   event_id:newEventId(),timestamp_utc:new Date().toISOString(),id:current.id,
   exercise_id:current.id,ply:current.ply,uci_tentado:advanced.player_moves[0],
   uci_sugerido_g5:current.melhor_uci,record_schema_version:'xadrez.sequence_attempt.v1',
   catalog_revision:CATALOG_REVISIONS[current.id],training_mode:'sequencia3',
   sequence_status:advanced.status,player_moves:advanced.player_moves.slice(),
   opponent_moves:advanced.opponent_moves.slice(),expected_line:advanced.line.slice(),
   matched_first_g5:advanced.player_moves[0]===current.melhor_uci,
   hints_used:advanced.hints,experimental:true,diagnostic_certified:false
  };
  const stored=sequenceRecorder.append(event);
  $('feedback').className='feedback '+(advanced.status==='complete'?'correct':'');
  const label=advanced.status==='complete'?'Sequência 3/3 concluída.':'Desvio da variante no lance '+advanced.deviation_ply+'/3. Este lance legal NÃO é necessariamente um erro.';
  $('feedback').textContent=label+(stored.saved?' Registro guardado exclusivamente no histórico de sequências.':' ATENÇÃO: sessão NÃO SALVA; exporte backup ou libere espaço.')+' O agendador G5 não foi alterado.';
  $('show').disabled=true;
 }
 renderSequenceStatus();drawBoard();
}
