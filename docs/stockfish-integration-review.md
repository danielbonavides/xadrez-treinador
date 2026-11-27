# PR #9 — Stockfish 19 Lite Single-Threaded WASM (Safari QA)

## Source, distribution and integrity
- Source: https://github.com/nmrugg/stockfish.js/tree/v19.0.1
- npm package: `stockfish@19.0.1` (pinned)
- Engine files: `vendor/stockfish/stockfish-19-lite-single.js` and `vendor/stockfish/stockfish-19-lite-single.wasm`
- JS SHA-256: `ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a`
- WASM SHA-256: `ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de`
- GPL-3.0: see upstream source and `vendor/stockfish/LICENSE-STOCKFISH.txt` copied from original npm package.
- Published URL **only after merge/deploy**: `https://danielbonavides.github.io/xadrez-treinador/vendor/stockfish/stockfish-19-lite-single.js`
- The matching WASM sits at the same URL with the `.wasm` suffix. No CDN, `importScripts`, Blob Worker, or runtime package install.
- The `vendor-stockfish.yml` workflow copies both assets and GPL license from pinned npm package, checks official SHA-256, and commits only on isolated PR branch. The old ASM file was removed.

## Runtime
- `new Worker(ENGINE_URL, {type:'classic'})` directly loads the same-origin JS; Emscripten resolves its adjacent WASM.
- Single thread: no `SharedArrayBuffer`, COOP or COEP requirement.
- GitHub Pages should serve `.js` as JavaScript and `.wasm` as `application/wasm`; check both via deployed responses, do not presume.
- Worker is lazy; stops on cancellation and on timeout; does not block UI thread.
- `info score cp` is UCI score from side to move and not necessarily White. Live analysis remains separate from historic G5 suggestions.
- Existing scoring, progress, exports/imports, PGNs, DEV and TESTE3 remain untouched.
- The Lite engine has smaller NNUE and is weaker than the full Stockfish, but remains stronger than typical human players.
- Distinct original synthesized sounds; no proprietary Chess.com sound files.

## Automated gates
- `npm test`: nine scripted openings; legality, special moves, themes, UI, sound; both trainer script syntax.
- Vendored engine tests: JS/WASM existence, official SHA-256, WASM magic, `WebAssembly.validate` (Node 22).
- Mock Worker tests: `uci`, `isready`, `position fen`, difficulty, `go`, `bestmove`, cancellation and error path.
- Real engine smoke test: spawn Node 22 Stockfish Lite JS; expect UCI `bestmove` within 20s.
- CI PASS does NOT certify actual iOS Safari runtime.

## Manual Safari iPhone gate — PR remains DRAFT until PASS
1. Open branch preview (or isolated preview URL), activate Stockfish, check no HTTP 403/404 or WASM error.
2. Complete one guided A+B opening; verify correct continuation with engine move.
3. Run `Analisar posição`; confirm evaluation, suggested UCI move and variation.
4. Change levels 3/10/18 and verify response across both colors.
5. In main trainer, load G5 position, analyze live, and continue against Stockfish; confirm attempts/history unaffected.
6. Movement/capture/check sounds, volume persistence, both boards, three themes, orientation Black, undo, castling, en passant and promotion.
7. Safari performance: responsive board, startup latency, reload/retry, error recovery, CPU/battery observation. Reduced-motion preference must be honored.
8. Test network disabled after cache only as a diagnostic. Do not claim offline capability without verified caching.

NO-GO for merge/deployment until source assets, CI, preview MIME/readback and Safari manual PASS are documented.
