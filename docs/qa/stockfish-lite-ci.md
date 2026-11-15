# Stockfish Lite CI — PR #9

- Commit tested: 9534039411080ba36fe59428e8d3e9ffd848f9f8
- GitHub Actions: https://github.com/danielbonavides/xadrez-treinador/actions/runs/43755367335
- Result: PASS
- Node version: v22.23.4
- Engine package: stockfish@19.0.1 lite single-threaded (JS + WASM)

## Test log

```text

> test
> node --test tests/*.test.mjs

TAP version 13
# Subtest: nine unique opening lessons
ok 1 - nine unique opening lessons
  ---
  duration_ms: 1.655595
  type: 'test'
  ...
# Subtest: legal SAN sequence: italiana
ok 2 - legal SAN sequence: italiana
  ---
  duration_ms: 12.934013
  type: 'test'
  ...
# Subtest: legal SAN sequence: escandinava
ok 3 - legal SAN sequence: escandinava
  ---
  duration_ms: 7.867969
  type: 'test'
  ...
# Subtest: legal SAN sequence: carokann
ok 4 - legal SAN sequence: carokann
  ---
  duration_ms: 5.312954
  type: 'test'
  ...
# Subtest: legal SAN sequence: pirc
ok 5 - legal SAN sequence: pirc
  ---
  duration_ms: 6.82904
  type: 'test'
  ...
# Subtest: legal SAN sequence: london
ok 6 - legal SAN sequence: london
  ---
  duration_ms: 7.203182
  type: 'test'
  ...
# Subtest: legal SAN sequence: evans
ok 7 - legal SAN sequence: evans
  ---
  duration_ms: 3.600244
  type: 'test'
  ...
# Subtest: legal SAN sequence: fegatello
ok 8 - legal SAN sequence: fegatello
  ---
  duration_ms: 6.249981
  type: 'test'
  ...
# Subtest: legal SAN sequence: dinamarques
ok 9 - legal SAN sequence: dinamarques
  ---
  duration_ms: 7.033347
  type: 'test'
  ...
# Subtest: legal SAN sequence: budapeste
ok 10 - legal SAN sequence: budapeste
  ---
  duration_ms: 5.293465
  type: 'test'
  ...
# Subtest: special rules: castling
ok 11 - special rules: castling
  ---
  duration_ms: 1.213161
  type: 'test'
  ...
# Subtest: special rules: en passant
ok 12 - special rules: en passant
  ---
  duration_ms: 0.980832
  type: 'test'
  ...
# Subtest: special rules: promotion
ok 13 - special rules: promotion
  ---
  duration_ms: 0.561363
  type: 'test'
  ...
# Subtest: illegal moves blocked
ok 14 - illegal moves blocked
  ---
  duration_ms: 1.195264
  type: 'test'
  ...
# Subtest: checkmate and stalemate detection
ok 15 - checkmate and stalemate detection
  ---
  duration_ms: 3.562668
  type: 'test'
  ...
# Subtest: undo restores full FEN
ok 16 - undo restores full FEN
  ---
  duration_ms: 3.199112
  type: 'test'
  ...
# Subtest: score policy: auto no credit, learner side, undo snapshots
ok 17 - score policy: auto no credit, learner side, undo snapshots
  ---
  duration_ms: 0.348133
  type: 'test'
  ...
# Subtest: UI essentials and isolated storage
ok 18 - UI essentials and isolated storage
  ---
  duration_ms: 0.19313
  type: 'test'
  ...
# Subtest: guided mode auto-plays opponent and flips black board
ok 19 - guided mode auto-plays opponent and flips black board
  ---
  duration_ms: 0.133791
  type: 'test'
  ...
# Subtest: original UX: themes and persistent audio controls
ok 20 - original UX: themes and persistent audio controls
  ---
  duration_ms: 0.205859
  type: 'test'
  ...
# Subtest: deviation displays expected move on board
ok 21 - deviation displays expected move on board
  ---
  duration_ms: 0.18006
  type: 'test'
  ...
# Subtest: Safari startup: DOM helper declared before theme and audio setup
ok 22 - Safari startup: DOM helper declared before theme and audio setup
  ---
  duration_ms: 0.135844
  type: 'test'
  ...
# Subtest: piece renderer matches original trainer SVG styling
ok 23 - piece renderer matches original trainer SVG styling
  ---
  duration_ms: 0.143245
  type: 'test'
  ...
# Subtest: original navigation links A+B without replacing original trainer
ok 24 - original navigation links A+B without replacing original trainer
  ---
  duration_ms: 0.820922
  type: 'test'
  ...
# Subtest: post-opening continuation uses legal bot moves and preserves chess position
ok 25 - post-opening continuation uses legal bot moves and preserves chess position
  ---
  duration_ms: 0.202574
  type: 'test'
  ...
# Subtest: all nine opening endings leave valid continuation for learner
ok 26 - all nine opening endings leave valid continuation for learner
  ---
  duration_ms: 60.003326
  type: 'test'
  ...
# Subtest: Stockfish and shared board effects wired in both trainers
ok 27 - Stockfish and shared board effects wired in both trainers
  ---
  duration_ms: 0.90633
  type: 'test'
  ...
# Subtest: inline browser scripts remain syntactically valid
ok 28 - inline browser scripts remain syntactically valid
  ---
  duration_ms: 4.494636
  type: 'test'
  ...
# Subtest: Stockfish Lite files self-hosted, pinned and browser-loadable
ok 29 - Stockfish Lite files self-hosted, pinned and browser-loadable
  ---
  duration_ms: 7.362416
  type: 'test'
  ...
# Subtest: Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation
ok 30 - Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation
  ---
  duration_ms: 1.327542
  type: 'test'
  ...
# Subtest: rejects engine failure, preserves actionable error and permits retry
ok 31 - rejects engine failure, preserves actionable error and permits retry
  ---
  duration_ms: 0.551728
  type: 'test'
  ...
# Subtest: rejects startup when browser lacks Web Worker
ok 32 - rejects startup when browser lacks Web Worker
  ---
  duration_ms: 0.16716
  type: 'test'
  ...
# Subtest: real Stockfish Lite binary answers UCI bestmove in Node 22
ok 33 - real Stockfish Lite binary answers UCI bestmove in Node 22
  ---
  duration_ms: 522.814819
  type: 'test'
  ...
1..33
# tests 33
# suites 0
# pass 33
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 588.374677
```
