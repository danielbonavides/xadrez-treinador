# PEU-001 — XADREZ Treinador (v1.0)

## Regras de operação
- D0 (Chat): definir comportamento, avaliar UX, revisar diagnósticos e descrever alterações sem abrir execução pesada.
- D1 (script local): cálculos determinísticos, validações de entradas e agregados; jamais transferir PGNs privados, cookies ou métricas pessoais para este repositório público.
- D2 (Codex): mudar código, aplicar testes de movimentação/regras, UI e regressão mínima por delta, branch e PR conforme autorizações.
- D3 (Work): somente quando auditoria autenticada multietapas exigir interação gráfica.
- Uma tarefa por objetivo; usar arquivo/commit/diff alvo, não rever toda a aplicação por padrão; preservar evidências, não despejar logs.
- Não sacrificar testes de movimentos legais, roque, en passant, promoção, histórico, preferência e orientação do tabuleiro por economia.
- Persistência científica continua sem destino autorizado neste repositório; se necessária, declarar `BLOCKED_PERSISTENCE`.
- Encerrar com fonte/revisão, arquivos alterados, testes, readback e `PASS/PARTIAL/BLOCKED`. Não publicar no GitHub Pages, mesclar ou liberar release sem autorização específica.

Handoff: `OBJETIVO | BASE SHA | DELTA | D0–D3 | TESTES | READBACK | STATUS`.
