# Stockfish Lite CI — PR #9

- Commit tested: ede8e12d182274dfc14b21799f6a99bdf2f3fc05
- GitHub Actions run: https://github.com/danielbonavides/xadrez-treinador/actions/runs/43755060976
- Result: FAIL
- Node version: v22.23.4
- Engine: stockfish@19.0.1 Lite single-threaded JS + WASM

## Test log

```text

> test
> node --test tests/*.test.mjs

TAP version 13
# file:///home/runner/work/xadrez-treinador/xadrez-treinador/tests/aberturas.test.mjs:143
#  assert.match(engine,/vendor\\\\/stockfish/);
#                      ^
# SyntaxError: Invalid regular expression flags
#     at compileSourceTextModule (node:internal/modules/esm/utils:346:16)
#     at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:110:18)
#     at \#translate (node:internal/modules/esm/loader:559:20)
#     at afterLoad (node:internal/modules/esm/loader:612:29)
#     at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:617:12)
#     at \#createModuleJob (node:internal/modules/esm/loader:640:36)
#     at \#getJobFromResolveResult (node:internal/modules/esm/loader:353:34)
#     at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:321:41)
#     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:680:25)
# Node.js v22.23.4
# Subtest: tests/aberturas.test.mjs
not ok 1 - tests/aberturas.test.mjs
  ---
  duration_ms: 38.693072
  type: 'test'
  location: '/home/runner/work/xadrez-treinador/xadrez-treinador/tests/aberturas.test.mjs:1:1'
  failureType: 'testCodeFailure'
  exitCode: 1
  signal: ~
  error: 'test failed'
  code: 'ERR_TEST_FAILURE'
  ...
# Subtest: Stockfish Lite files self-hosted, pinned and browser-loadable
ok 2 - Stockfish Lite files self-hosted, pinned and browser-loadable
  ---
  duration_ms: 9.847534
  type: 'test'
  ...
# Subtest: Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation
not ok 3 - Safari-style classic Worker: UCI handshake, scoring, difficulty and cancellation
  ---
  duration_ms: 30014.314051
  type: 'test'
  location: '/home/runner/work/xadrez-treinador/xadrez-treinador/tests/stockfish-worker.test.mjs:41:1'
  failureType: 'testCodeFailure'
  error: 'Stockfish indisponível: timeout de inicialização (30s)'
  code: 'ERR_TEST_FAILURE'
  stack: |-
    fail (file:///home/runner/work/xadrez-treinador/xadrez-treinador/shared/stockfish-browser.mjs:24:30)
    Timeout.<anonymous> (file:///home/runner/work/xadrez-treinador/xadrez-treinador/shared/stockfish-browser.mjs:30:35)
    listOnTimeout (node:internal/timers:585:17)
    process.processTimers (node:internal/timers:521:7)
  ...
# Subtest: rejects engine failure, preserves actionable error and permits retry
ok 4 - rejects engine failure, preserves actionable error and permits retry
  ---
  duration_ms: 2.065269
  type: 'test'
  ...
# Subtest: rejects startup when browser lacks Web Worker
ok 5 - rejects startup when browser lacks Web Worker
  ---
  duration_ms: 0.247741
  type: 'test'
  ...
# Subtest: real Stockfish Lite binary answers UCI bestmove in Node 22
not ok 6 - real Stockfish Lite binary answers UCI bestmove in Node 22
  ---
  duration_ms: 33.33118
  type: 'test'
  location: '/home/runner/work/xadrez-treinador/xadrez-treinador/tests/stockfish-worker.test.mjs:81:1'
  failureType: 'testCodeFailure'
  error: |-
    Stockfish exited 1; stderr: lite-single.js:12:23005
        at file:///home/runner/work/xadrez-treinador/xadrez-treinador/vendor/stockfish/stockfish-19-lite-single.js:12:27862
        at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
        at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
        at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
    
    Node.js v22.23.4
    
  code: 'ERR_TEST_FAILURE'
  stack: |-
    file:///home/runner/work/xadrez-treinador/xadrez-treinador/vendor/stockfish/stockfish-19-lite-single.js:12:27862
    ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
    async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
    ChildProcess.<anonymous> (file:///home/runner/work/xadrez-treinador/xadrez-treinador/tests/stockfish-worker.test.mjs:95:45)
    ChildProcess.emit (node:events:519:28)
    ChildProcess._handle.onexit (node:internal/child_process:293:12)
  ...
1..6
# tests 6
# suites 0
# pass 3
# fail 3
# cancelled 0
# skipped 0
# todo 0
# duration_ms 30125.406979
```
