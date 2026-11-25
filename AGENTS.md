# AGENTS.md — XADREZ Treinador

## Copilot Free — adoção consultiva condicionada (25/11/2026)
Auxiliar manual D0/D2, conforme [protocolo local](docs/governanca/COPILOT_FREE_CONSULTIVO_V1.md) e adaptador `.github/copilot-instructions.md`. Preflight de plano Free e privacidade obrigatório, ainda não verificado; até confirmar, somente exemplos sintéticos/minimizados sem anexar repositório. Sem autonomia, credenciais, dados reais, ações externas, gates alterados ou merge. A autoridade local e todas as regras abaixo permanecem vigentes.

Orientações para agentes responsáveis pelo aplicativo de treino de xadrez.

- Preservar regras de movimentos legais, orientações de tabuleiro, histórico, roque, en passant, promoção, estado e preferências. Alteração de comportamento exige testes apropriados.
- Não incluir PGNs privados, credenciais, tokens ou datasets pessoais na aplicação pública.
- Publicação em GitHub Pages, merge, release e alterações de produção exigem autorização específica; somente documentação e artefatos autorizados entram em branch/PR.

## Persistência de artefatos

Container efêmero: arquivo só em `/tmp`, `/home`, `.runtime/` ou sandbox está perdido no fim da sessão. Este repositório é **público** e **não tem destino autorizado** para dados científicos ou privados; o desenvolvimento web segue o fluxo já estabelecido.

- Não enviar ZIPs, PGNs, matrizes ou dados do jogador ao Git.
- Se uma tarefa precisar guardar artefatos que devem sobreviver à sessão, registrar `BLOCKED_PERSISTENCE`, não improvisar destino e pedir ao titular um destino autorizado. Com destino autorizado, seguir `docs/governanca/PERSISTENCE_PROTOCOL_V1.3.md` (prova de ida e volta antes de computação pesada, checkpoints e readback final).
- Destino de armazenamento autorizado não autoriza merge, release, GitHub Pages nem Production.
