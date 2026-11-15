# Stockfish browser integration — experimental review

- Source: https://github.com/nmrugg/stockfish.js
- Package: stockfish@19.0.1
- Runtime URL: https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-asm.js
- Engine license: GPL-3.0; upstream source and license at https://github.com/nmrugg/stockfish.js
- Engine is downloaded on demand into a classic Web Worker; not included in this repository.
- CDN availability and actual iOS Safari runtime are **not verified**. A CI static/syntax PASS does not prove engine startup.
- ASM build selected for Safari compatibility, but is slower than the recommended WASM lite-single. Production should vendor the matching JS/WASM pair and verify MIME types, licensing and mobile performance.
- Existing G5 positions, scoring, imports, and exports remain independent of live engine.
- Engine analysis is indicative. CP is from side to move, not automatically from White.
- UI effects use original synthesized audio; no Chess.com audio files or trademarks are copied.
- Manual Safari checks required: 3 board themes, both colors, promotion, castling, en passant, capture, check, sound on/off, volume persistence, reduced motion, worker startup, timeout, cancellation, battery/CPU, offline fallback, and existing G5 exercise history.
- PR must remain DRAFT until all checks pass. Do not merge or deploy on static tests alone.
