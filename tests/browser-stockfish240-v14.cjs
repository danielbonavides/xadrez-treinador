'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto('http://127.0.0.1:8765/teste-v1.4/index.html',{waitUntil:'networkidle'});
  await page.locator('nav button[data-tab="trainer"]').click();
  await page.locator('#puzzleInfo').waitFor();
  await page.waitForFunction(()=>document.querySelector('#puzzleInfo').textContent.includes('EX0001'));
  await page.locator('#stockfishBundle').evaluate(el=>{el.closest('details').open=true;});
  await page.locator('#stockfishBundle').setInputFiles(path.join(__dirname,'..','stockfish-240','EXERCICIOS_PUBLICOS_240_RESEARCH.json'));
  await page.waitForFunction(()=>document.querySelector('#stockfishImportNotice').textContent.includes('240/240'));
  assert.match(await page.locator('#stockfishImportNotice').textContent(),/68 divergências/);
  assert.match(await page.locator('#stockfishEvidence').textContent(),/Sugestão histórica G5/);
  for(let i=0;i<5;i++)await page.locator('#next').click();
  await page.waitForFunction(()=>document.querySelector('#puzzleInfo').textContent.includes('EX0006'));
  await page.waitForFunction(()=>document.querySelector('#stockfishEvidence').textContent.includes('G5 e Stockfish divergem'));
  await page.locator('#stockfishDisable').click();
  await page.waitForFunction(()=>document.querySelector('#stockfishEvidence').textContent.includes('desligada nesta sessão'));
  await page.locator('#stockfishBundle').setInputFiles(path.join(__dirname,'..','stockfish-240','EXERCICIOS_PUBLICOS_240_RESEARCH.json'));
  await page.waitForFunction(()=>document.querySelector('#stockfishEvidence').textContent.includes('G5 e Stockfish divergem'));
  const before=await page.evaluate(()=>({attempts:localStorage.getItem('xadrez_v1_attempts_test_v1_4'),production:localStorage.getItem('xadrez_v1_attempts')}));
  assert.equal(before.attempts,null,'Evidence import must not create attempt history');
  assert.equal(before.production,null,'Production history key must remain untouched');
  await page.evaluate(()=>{
   const move=R88.legal(visibleState).find(m=>R88.uci(m)===current.melhor_uci);
   if(!move)throw Error('G5 suggestion is not legal in active position');
   commitLegalMove(move);
  });
  await page.waitForFunction(()=>document.querySelector('#reviewStatus').textContent.includes('24 h'));
  const attempts=await page.evaluate(()=>JSON.parse(localStorage.getItem('xadrez_v1_attempts_test_v1_4')||'[]'));
  assert.equal(attempts.length,1);
  assert.equal(attempts[0].acertou,true);
  assert.equal(attempts[0].uci_sugerido_g5,'e4d5');
  assert.equal(attempts[0].uci_tentado,'e4d5');
  assert.deepEqual(pageErrors,[]);
  console.log('PASS Chromium browser smoke: local JSON import, EX0006 divergence, G5 attempt and 24h schedule; no production writes or page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
