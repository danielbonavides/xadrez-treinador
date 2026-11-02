/* HOF-XWEB-1.2-STOCKFISH240-v1.0: strictly optional, isolated, read-only UI.
   Exposes no scoring, persistence, scheduling or migration operations. */
(function() {
  'use strict';
  const panel=document.getElementById('sfResearch');
  if (!panel || typeof Adaptive==='undefined' || typeof Adaptive.PedagogyAdapter!=='function') return;
  const toggle=document.getElementById('sfToggle');
  const status=document.getElementById('sfStatus');
  const details=document.getElementById('sfDetails');
  let enabled=false, catalog=null, loaded=false, failure=null, pending=null, nonce=0;
  function formatScore(line) {
    return line.mate!==null ? 'MATE '+(line.mate>0?'+':'')+line.mate :
      'CP '+(line.cp>0?'+':'')+line.cp;
  }
  function put(tag,content,parent) {
    const el=document.createElement(tag);el.textContent=content;parent.appendChild(el);return el;
  }
  function render() {
    if (!enabled) {status.textContent='Desligado nesta sessão. O treino G5 continua independente.';details.replaceChildren();return;}
    if (failure) {status.textContent='Análise indisponível: '+failure+'. O treino permanece normal.';details.replaceChildren();return;}
    if (!loaded) {status.textContent='Carregando evidências opcionais…';details.replaceChildren();return;}
    if (typeof current==='undefined' || !current) {status.textContent='Escolha um exercício para consultar a reanálise.';details.replaceChildren();return;}
    const item=catalog.byId.get(current.id);
    if (!item) {status.textContent='Painel desabilitado apenas para '+current.id+': '+(catalog.errors.get(current.id)||'sem evidência válida');details.replaceChildren();return;}
    status.textContent='Stockfish 19 · depth 10 · MultiPV 2 · pesquisa não certificada';
    details.replaceChildren();
    put('p','Sugestão histórica G5: '+item.g5,details);
    put('p','Primeira linha da reanálise Stockfish: '+item.lines.multipv_top_1.root_uci,details);
    if (item.different) put('p','As sugestões diferem. Isso não comprova erro do G5.',details);
    for (const [key,title] of [['multipv_top_1','Principal'],['multipv_top_2','Alternativa'],['human_forced','Lance humano (busca forçada)'],['g5_forced','Sugestão G5 (busca forçada)']]) {
      const line=item.lines[key];
      put('p',title+': '+line.pv_uci.join(' ')+' · '+formatScore(line)+' · profundidade '+line.depth,details);
    }
    if (item.hint) put('p','Dica experimental: '+item.hint,details);
    put('small','Avaliação na perspectiva de quem joga. Buscas independentes não equivalem a perda de centipões certificada. Sem diagnóstico tático certificado.',details);
  }
  function getJson() {
    // Promise boundary catches malformed inline JSON, unsupported file:// fetch,
    // network errors and HTTP responses without affecting the G5 trainer.
    return Promise.resolve().then(() => {
      const embedded=document.getElementById('sfPublicJSON');
      if (embedded && embedded.textContent.trim()) return JSON.parse(embedded.textContent);
      const url=panel.dataset && panel.dataset.jsonUrl || './stockfish-240/EXERCICIOS_PUBLICOS_240_RESEARCH.json';
      return fetch(url, {cache:'no-store',credentials:'omit'})
        .then(response=>{if(!response.ok)throw Error('HTTP_'+response.status);return response.json();});
    });
  }
  async function activate() {
    const request=++nonce;
    enabled=true;toggle.setAttribute('aria-pressed','true');toggle.textContent='Desligar análise Stockfish';render();
    if (loaded || failure) return;
    if (!pending) pending=getJson().then(data=>{
      // Validate entire catalogue without touching DATA, records or adaptive state.
      const normalized=Adaptive.PedagogyAdapter(data,DATA.puzzles,R88);
      if (!normalized.available)throw Error(normalized.status||'CONTRATO_PEDAGOGICO_INDISPONIVEL');
      // Individual discrepancies only disable the corresponding research panel.
      catalog=normalized;loaded=true;
    }).catch(error=>{failure=String(error.message||error).slice(0,90);});
    await pending;
    if (request===nonce && enabled) render();
  }
  toggle.addEventListener('click',()=>{
    if(enabled){enabled=false;nonce++;toggle.setAttribute('aria-pressed','false');toggle.textContent='Ligar análise Stockfish';render();}
    else activate();
  });
  // The legacy trainer processes the same click before this callback.
  for (const id of ['next','reset','show','board','promotionChoice','modal','phase','color','refreshQueue','trainingMode','cadence','importProgress']) {
    const el=document.getElementById(id);
    if(el) for(const eventType of ['click','change']) el.addEventListener(eventType,()=>queueMicrotask(render));
  }
  for (const nav of document.querySelectorAll('nav button')) nav.addEventListener('click',()=>queueMicrotask(render));
  window.addEventListener('storage',()=>queueMicrotask(render));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueMicrotask(render);});
  render();
})();