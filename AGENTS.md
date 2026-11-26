# AGENTS.md — XADREZ Treinador

Orientações para agentes responsáveis pelo aplicativo de treino de xadrez.

- Preservar regras de movimentos legais, orientações de tabuleiro, histórico, roque, en passant, promoção, estado e preferências. Alteração de comportamento exige testes apropriados.
- Não incluir PGNs privados, credenciais, tokens ou datasets pessoais na aplicação pública.
- Publicação em GitHub Pages, merge, release e alterações de produção exigem autorização específica; somente documentação e artefatos autorizados entram em branch/PR.

## Persistência de artefatos

Container efêmero: arquivo só em `/tmp`, `/home`, `.runtime/` ou sandbox está perdido no fim da sessão. Este repositório é **público** e **não tem destino autorizado** para dados científicos ou privados; o desenvolvimento web segue o fluxo já estabelecido.

- Não enviar ZIPs, PGNs, matrizes ou dados do jogador ao Git.
- Se uma tarefa precisar guardar artefatos que devem sobreviver à sessão, registrar `BLOCKED_PERSISTENCE`, não improvisar destino e pedir ao titular um destino autorizado. Com destino autorizado, seguir `docs/governanca/PERSISTENCE_PROTOCOL_V1.3.md` (prova de ida e volta antes de computação pesada, checkpoints e readback final).
- Destino de armazenamento autorizado não autoriza merge, release, GitHub Pages nem Production.

## PEU-001 — economia de utilização (19/11/2026)

Seguir `docs/governanca/PEU_001_ECONOMIA_UTILIZACAO.md`: D0 Chat para especificação e análise, D1 script local para cálculo/QA, D2 Codex para implementação e testes direcionados, D3 Work só se navegação GUI multietapas necessária. Uma tarefa por objetivo, leitura por arquivo/diff, evitar tentativas equivalentes repetidas; entregar handoff curto com revisão, testes/readback e `PASS/PARTIAL/BLOCKED`.

**Sem redução de segurança ou rigor:** preservar testes de regras de xadrez, privacidade, ausência de destino científico autorizado e proibições de merge/release/publicação sem aprovação.

- Graphify: consulta padrão D0/D2 nas alterações relevantes, quando índice autorizado e SHA verificado; seguir a seção específica do PEU-001, com fallback GitHub/testes, sem gate adicional, revisão automática obrigatória ou ampliação de acesso. Preservar privacidade, plano Free e gates locais.
