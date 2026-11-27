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

## Graphify — consulta padrão por relevância (26/11/2026)

Auxiliar consultivo D0/D2 em mudanças relevantes de código, arquitetura, contratos, dependências, segurança e testes; não é executor nem novo gate. Antes da implementação, confirmar repositório autorizado, SHA da base e SHA indexado; consultar somente símbolos, impacto, dependentes e testes relacionados necessários. Durante a revisão pré-squash, conciliar o grafo da base com arquivos/diff/HEAD real da PR. Após merge, verificar SHA indexado contra a main antes de analisar a evolução. Em grafo integrado, conferir a atualização e autorização de cada repositório envolvido.

- Tarefa trivial sem impacto: NOT_APPLICABLE com motivo. Índice desatualizado/ausente ou ferramenta indisponível: STALE_INDEX/NOT_INDEXED/UNAVAILABLE, fallback GitHub e testes; não presumir ausência de dependências, uso ou cobertura. Achados estáticos não substituem testes nem homologação.
- Respeitar franquia efetiva Free; revisão automatizada de PR é separada e não obrigatória. Não ativar novos índices, trocar plano/permissões, publicar notas ou resultados automaticamente, nem transmitir dados pessoais, PGNs privados, corpus, credenciais ou dados canônicos. Não usar memória do grafo como autoridade normativa.
- Registrar CONSULTED ou status de fallback, repositório, SHA da base/indexado/HEAD da PR, consultas, impacto, limites e testes. Preservar D0–D3, gates científicos, persistência, privacidade, merge e publicação exclusivos do titular. Nenhum novo executor, automação, deploy ou ação externa autorizado pela regra.
