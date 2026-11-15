// node --test tests/aberturas.test.mjs  (npm install required for chess.js)
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Chess} from 'chess.js';
const html=readFileSync(new URL('../aberturas-lab.html',import.meta.url),'utf8');
const match=html.match(/const lessons=([\s\S]*?);\s*for\(const l of lessons\)/);
assert.ok(match,'lesson registry');
const lessons=Function('return '+match[1])();
const ids=['italiana','escandinava','carokann','pirc','london','evans','fegatello','dinamarques','budapeste'];
test('nine unique opening lessons',()=>assert.deepEqual(lessons.map(x=>x.id),ids));
for(const l of lessons)test('legal SAN sequence: '+l.id,()=>{
 const game=new Chess();
 assert.equal(l.moves.length,l.notes.length,'every move has feedback');
 for(const [i,san] of l.moves.entries()){
  const legal=game.moves();assert.ok(legal.includes(san),l.id+' move '+(i+1)+' '+san);
  game.move(san);
 }
 assert.ok(game.fen().split(' ').length===6);
});
test('special rules: castling',()=>{
 const g=new Chess();for(const san of ['e4','e5','Nf3','Nc6','Bc4','Bc5','O-O'])g.move(san);
 assert.equal(g.get('g1')?.type,'k');assert.equal(g.get('f1')?.type,'r');
});
test('special rules: en passant',()=>{
 const g=new Chess();for(const san of ['e4','a6','e5','d5','exd6'])g.move(san);
 assert.equal(g.get('d5'),undefined);assert.equal(g.get('d6')?.type,'p');
});
test('special rules: promotion',()=>{
 const g=new Chess('8/P7/7k/8/8/8/8/4K3 w - - 0 1');
 g.move({from:'a7',to:'a8',promotion:'n'});assert.equal(g.get('a8')?.type,'n');
});
test('illegal moves blocked',()=>{const g=new Chess();assert.throws(()=>g.move('e5'));assert.equal(g.fen(),new Chess().fen())});
test('checkmate and stalemate detection',()=>{
 const mate=new Chess();for(const s of ['f3','e5','g4','Qh4#'])mate.move(s);assert.ok(mate.isCheckmate());
 const stale=new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');assert.ok(stale.isStalemate());
});
test('undo restores full FEN',()=>{
 const g=new Chess();const original=g.fen();g.move('e4');g.undo();assert.equal(g.fen(),original);
});
test('score policy: auto no credit, learner side, undo snapshots',()=>{
 assert.match(html,/source==='manual'&&turn===learnerColor\(\)/);
 assert.match(html,/manualUserMoves===learnerMoveCount\(\)/);
 assert.match(html,/mode=last.mode;stats=\{\.\.\.last.stats\}/);
 assert.match(html,/commit\(\{from:move.from,to:move.to,promotion:move.promotion\},'auto'\)/);
 assert.match(html,/if\(source==='manual'&&turn===learnerColor\(\)\)stats.deviations\+\+/);
});
test('UI essentials and isolated storage',()=>{
 for(const id of ['board','promotion','back','next','restart','hint','lesson','guided','free','correct','deviations','completed','export'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes("xadrez_ab_lab_v1"));assert.ok(!html.includes('localStorage.clear'));
 assert.ok(html.includes('@media(max-width:730px)'));
});

test('guided mode auto-plays opponent and flips black board',()=>{
 assert.match(html,/function autoOpponent\(\)/);
 assert.match(html,/if\(source==='manual'&&mode==='guided'\)autoOpponent\(\)/);
 assert.match(html,/notice='Pronto para treinar';render\(\);autoOpponent\(\)/);
 assert.match(html,/learnerColor\(\)==='b'\?'hgfedcba'/);
 assert.match(html,/last\.move\.color!==learnerColor\(\)/);
});

test('original UX: themes and persistent audio controls',()=>{
 for(const id of ['boardTheme','audioToggle','audioNotice','lineHint'])assert.ok(html.includes('id="'+id+'"'),id);
 for(const key of ['xadrez_web_theme_v1','xadrez_web_sound_enabled_v1'])assert.ok(html.includes(key));
 for(const kind of ['move','capture','castle','promotion','check'])assert.ok(html.includes(kind+':['));
 assert.match(html,/function playMoveSound\(kind\)/);
 assert.match(html,/playMoveSound\(soundKind\(played\)\)/);
 assert.match(html,/data-theme="classic"/);
 assert.match(html,/data-theme="light"/);
});
test('deviation displays expected move on board',()=>{
 assert.match(html,/lineSuggestion=expectedMove\(\);mode='free'/);
 assert.match(html,/classList.add\('expected-from'\)/);
 assert.match(html,/classList.add\('expected-to'\)/);
 assert.match(html,/Lance da linha:/);
 assert.match(html,/lineSuggestion=null;notice='Lance desfeito'/);
});

test('Safari startup: DOM helper declared before theme and audio setup',()=>{
 const helper=html.indexOf('const $=id=>document.getElementById(id)');
 const theme=html.indexOf("const THEME_KEY='xadrez_web_theme_v1'");
 const audio=html.indexOf("const AUDIO_KEY='xadrez_web_sound_enabled_v1'");
 assert.ok(helper>0&&helper<theme&&theme<audio);
 assert.equal(html.split('const $=id=>document.getElementById(id)').length-1,1);
});

test('style B: solid white glyphs with navy outline on all three themes',()=>{
 assert.match(html,/span\.textContent=glyph\[piece\.type\]/);
 assert.match(html,/\.sq \.piece\.white\{[^}]*-webkit-text-fill-color:#ffffff/);
 assert.match(html,/\.sq \.piece\.white\{[^}]*-webkit-text-stroke:1\.35px #102a43/);
 assert.match(html,/body\[data-theme="classic"\]/);
 assert.match(html,/body\[data-theme="light"\] \.sq \.piece\.white\{[^}]*-webkit-text-stroke:1\.35px #102a43/);
 assert.ok(!html.includes("glyph[piece.type].replace('♚','♔')"),'avoid hollow white Unicode glyph');
});
