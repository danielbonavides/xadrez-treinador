# Contrato normalizado — XADREZ Stockfish 240

**Versão de origem:** `xadrez.pedagogia.catalogo.experimental.v1.3`  
**Versão dos itens:** `xadrez.pedagogia.v1.3`  
**Fonte:** `EXERCICIOS_PUBLICOS_240_RESEARCH.json` (somente dados públicos anonimizados).

## Junção canônica

| Origem Stockfish | Catálogo Web v1.2/v1.4 | Regra |
|---|---|---|
| `exercise_id` | `DATA.puzzles[].id` | Identidade exata e única |
| `position.fen_before` | `fen` | Igualdade byte a byte |
| `position.ply` | `ply` | Igualdade numérica |
| `position.side_to_move` | lado no FEN | Deve corresponder a `w` ou `b` |
| `candidate.suggested_uci_g5` | `melhor_uci` | Igualdade UCI; preserva a sugestão histórica |

## Evidência de pesquisa

Cada exercício contém quatro linhas distintas: `multipv_top_1`, `multipv_top_2`, `human_forced` e `g5_forced`. Cada linha inclui `root_uci`, `pv_uci`, profundidade atingida e uma avaliação na perspectiva de quem joga.

- CP é inteiro em centipawns; MATE é inteiro separado. Exatamente um dos campos `score_cp_pov_player` e `mate_in_pov_player` deve estar preenchido.
- A PV deve começar pelo `root_uci` e cada lance UCI é reproduzido legalmente com o motor R88 da própria Web.
- O contrato exige Stockfish 19, profundidade solicitada 10, MultiPV 2, `engine_verified=true`, `legal_moves_verified=true`, `privacy_review=true` e `diagnostic_certified=false`.
- Whitelist estrita de campos impede a entrada de identificadores privados, nomes de jogador/adversário, URLs, PGNs, IDs de partidas, e-mails, tokens e contas.

## Saída do adaptador

`Adaptive.PedagogyAdapter(data, DATA.puzzles, R88)` devolve `available`, `status` (`ready` ou `partial`), `byId`, `errors` e estatísticas. Erro global de schema desabilita o pacote. Erro local desabilita apenas o painel do exercício afetado.

## Limites pedagógicos

1. **Sugestão histórica G5** continua a determinar pontuação e registro de tentativa.
2. **Análise Stockfish experimental** é evidência de pesquisa, não diagnóstico certificado.
3. **Diagnóstico tático certificado** permanece futuro e depende de regras/testes específicos.

As 68 divergências entre MultiPV 1 e G5 não são classificadas automaticamente como erro. O adaptador não altera `acertou`, `uci_sugerido_g5`, tentativas, identidades, estágio, intervalos ou preferências.
