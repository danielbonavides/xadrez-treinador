function resetQueue(){collectPreferences();queueReady=false;current=null;counter=0;used.clear();sel=null;result=null;visibleState=null;pendingPromotion=null;lastMove=null;renderAdaptive();startPuzzle();}
function startPuzzle(){
 if(!document.getElementById('trainer').classList.contains('active'))return;
 // Recalcular a cada avanço inclui vencimentos e importações, sem repetir a sessão inteira.
 projections=projectNow();
 const ids=Adaptive.QueueBuilder(projections,prefs).map(p=>p.exercise_id);
 if(!queueReady){used.clear();counter=0;queueReady=true;}
 queue=ids.filter(id=>!used.has(id)).map(id=>DATA.puzzles.find(p=>p.id===id));
 current=queue[0]||null;sel=null;result=null;pendingPromotion=null;lastMove=null;visibleState=null;togglePromotionUi();$('moveArrow').innerHTML='';
 if(!current){$('feedback').className='feedback';$('feedback').textContent='Fila concluída ou sem posições disponíveis neste modo e filtro. Altere o modo ou atualize a fila quando houver revisões vencidas.';$('board').innerHTML='';$('puzzleMeta').textContent='FILA VAZIA';$('puzzleTitle').textContent='Treino em dia';$('puzzleInfo').textContent='';$('progressText').textContent='Nenhuma tentativa criada.';$('progressBar').style.width='100%';$('show').disabled=true;renderAdaptive();return;}
 used.add(current.id);counter++;visibleState=R88.parse(current.fen);drawBoard();$('feedback').className='feedback';$('feedback').textContent='Sua vez. Selecione a origem e o destino do lance sugerido.';
 $('puzzleMeta').textContent=`${current.modalidade} · ${pretty[current.fase]||current.fase} · ${current.cor}`;$('puzzleTitle').textContent='Qual lance o G5 sugeriu?';
 $('puzzleInfo').textContent=`Exercício ${current.id} · Lance ${Math.ceil(current.ply/2)}`;
 $('progressText').textContent=`Posição ${counter}. ${queue.length-1} restantes na fila. Tentativas persistidas: ${attempts.length}.`;
 $('progressBar').style.width=Math.round(counter/(counter+queue.length-1)*100)+'%';$('show').disabled=false;renderAdaptive();
}
