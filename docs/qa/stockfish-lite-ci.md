# Stockfish Lite CI — PR #9

- Commit tested: 
- GitHub Actions: https://github.com/danielbonavides/xadrez-treinador/actions/runs/43755257993
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
  duration_ms: 1.157089
  type: 'test'
  ...
# Subtest: legal SAN sequence: italiana
ok 2 - legal SAN sequence: italiana
  ---
  duration_ms: 13.514537
  type: 'test'
  ...
# Subtest: legal SAN sequence: escandinava
ok 3 - legal SAN sequence: escandinava
  ---
  duration_ms: 10.598079
  type: 'test'
  ...
# Subtest: legal SAN sequence: carokann
ok 4 - legal SAN sequence: carokann
  ---
  duration_ms: 9.36812
  type: 'test'
  ...
# Subtest: legal SAN sequence: pirc
ok 5 - legal SAN sequence: pirc
  ---
  duration_ms: 6.102079
  type: 'test'
  ...
# Subtest: legal SAN sequence: london
ok 6 - legal SAN sequence: london
  ---
  duration_ms: 2.765663
  type: 'test'
  ...
# Subtest: legal SAN sequence: evans
ok 7 - legal SAN sequence: evans
  ---
  duration_ms: 2.140459
  type: 'test'
  ...
# Subtest: legal SAN sequence: fegatello
ok 8 - legal SAN sequence: fegatello
  ---
  duration_ms: 2.806334
  type: 'test'
  ...
# Subtest: legal SAN sequence: dinamarques
ok 9 - legal SAN sequence: dinamarques
  ---
  duration_ms: 1.962222
  type: 'test'
  ...
# Subtest: legal SAN sequence: budapeste
ok 10 - legal SAN sequence: budapeste
  ---
  duration_ms: 3.249932
  type: 'test'
  ...
# Subtest: special rules: castling
ok 11 - special rules: castling
  ---
  duration_ms: 1.214525
  type: 'test'
  ...
# Subtest: special rules: en passant
ok 12 - special rules: en passant
  ---
  duration_ms: 1.003169
  type: 'test'
  ...
# Subtest: special rules: promotion
ok 13 - special rules: promotion
  ---
  duration_ms: 0.515721
  type: 'test'
  ...
# Subtest: illegal moves blocked
ok 14 - illegal moves blocked
  ---
  duration_ms: 1.128016
  type: 'test'
  ...
# Subtest: checkmate and stalemate detection
ok 15 - checkmate and stalemate detection
  ---
  duration_ms: 2.125657
  type: 'test'
  ...
# Subtest: undo restores full FEN
ok 16 - undo restores full FEN
  ---
  duration_ms: 0.422141
  type: 'test'
  ...
# Subtest: score policy: auto no credit, learner side, undo snapshots
ok 17 - score policy: auto no credit, learner side, undo snapshots
  ---
  duration_ms: 0.255421
  type: 'test'
  ...
# Subtest: UI essentials and isolated storage
ok 18 - UI essentials and isolated storage
  ---
  duration_ms: 0.199829
  type: 'test'
  ...
# Subtest: guided mode auto-plays opponent and flips black board
ok 19 - guided mode auto-plays opponent and flips black board
  ---
  duration_ms: 0.143404
  type: 'test'
  ...
# Subtest: original UX: themes and persistent audio controls
ok 20 - original UX: themes and persistent audio controls
  ---
  duration_ms: 0.18787
  type: 'test'
  ...
# Subtest: deviation displays expected move on board
ok 21 - deviation displays expected move on board
  ---
  duration_ms: 0.176694
  type: 'test'
  ...
# Subtest: Safari startup: DOM helper declared before theme and audio setup
ok 22 - Safari startup: DOM helper declared before theme and audio setup
  ---
  duration_ms: 0.12094
  type: 'test'
  ...
# Subtest: piece renderer matches original trainer SVG styling
ok 23 - piece renderer matches original trainer SVG styling
  ---
  duration_ms: 0.169914
  type: 'test'
  ...
# Subtest: original navigation links A+B without replacing original trainer
ok 24 - original navigation links A+B without replacing original trainer
  ---
  duration_ms: 0.871813
  type: 'test'
  ...
# Subtest: post-opening continuation uses legal bot moves and preserves chess position
ok 25 - post-opening continuation uses legal bot moves and preserves chess position
  ---
  duration_ms: 0.224916
  type: 'test'
  ...
# Subtest: all nine opening endings leave valid continuation for learner
ok 26 - all nine opening endings leave valid continuation for learner
  ---
  duration_ms: 61.926235
  type: 'test'
  ...
# Subtest: Stockfish and shared board effects wired in both trainers
ok 27 - Stockfish and shared board effects wired in both trainers
  ---
  duration_ms: 1.166693
  type: 'test'
  ...
# Subtest: inline browser scripts remain syntactically valid
ok 28 - inline browser scripts remain syntactically valid
  ---
  duration_ms: 5.919427
  type: 'test'
  ...
# Subtest: Stockfish Lite files self-hosted, pinned and browser-loadable
ok 29 - Stockfish Lite files self-hosted, pinned and browser-loadable
  ---
  duration_ms: 7.69803
  type: 'test'
  ...
# Subtest: Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation
ok 30 - Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation
  ---
  duration_ms: 1.223769
  type: 'test'
  ...
# Subtest: rejects engine failure, preserves actionable error and permits retry
ok 31 - rejects engine failure, preserves actionable error and permits retry
  ---
  duration_ms: 0.574719
  type: 'test'
  ...
# Subtest: rejects startup when browser lacks Web Worker
ok 32 - rejects startup when browser lacks Web Worker
  ---
  duration_ms: 0.172417
  type: 'test'
  ...
# Subtest: real Stockfish Lite binary answers UCI bestmove in Node 22
ok 33 - real Stockfish Lite binary answers UCI bestmove in Node 22
  ---
  duration_ms: 519.599185
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
# duration_ms 587.245516
```
