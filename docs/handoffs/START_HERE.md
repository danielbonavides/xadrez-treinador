# XADREZ Treinador — START HERE
**Handoff público sanitizado | 2026-11-27**

## 1. Escopo e autoridade
Aplicativo web estático de treino de xadrez, com tabuleiro, regras legais, exercícios, histórico local e análise experimental. [AGENTS.md](../../AGENTS.md) prevalece. Repositório público, sem destino autorizado para dados privados/científicos. Nenhuma autorização implícita de GitHub Pages, release ou merge.

## 2. Base e governança
Base main `00d2e4a65325521c86c5a3f64d27fc281b637c5e`. Ausência do handoff anterior registrada nos snapshots iniciais [#13](history/peu-001-codex-permissions-20261126/START_HERE_BEFORE.md) e [#12](history/copilot-consultive-20261125/START_HERE_BEFORE.md). PR #13 integra #11 (PEU-001/Graphify, HEAD `a5b98b5676b8990a2a9b8d2eef827a7636d5c8ca`) e #12 (Copilot, HEAD `9cb6dac9c2dd7cdfa55d2ac5e1ecabf6b32c0d99`); cópias documentais preservadas. Exceção histórica #11 anterior à regra snapshot-first.
- [PEU-001](../governanca/PEU_001_ECONOMIA_UTILIZACAO.md): D0–D3, deltas, Graphify consultivo por relevância e fallback GitHub/testes. Sem gates adicionais ou perda de rigor.
- [Copilot Free](../governanca/COPILOT_FREE_CONSULTIVO_V1.md): manual, condicionado ao preflight de plano/privacidade; somente exemplos sintéticos minimizados até confirmação. Casos locais não executados.
- [Codex](../governanca/CODEX_PERMISSOES_V1.md): D2 manual com workspace-write/on-request/auto_review quando disponível; auditoria read-only; preflight efetivo obrigatório. Configuração local não aplicada ou comprovada.
- CLAUDE.md remete à autoridade única AGENTS.md.

## 3. Estado e evidências
- PR #3: v1.4 adaptativa experimental; [CI](https://github.com/danielbonavides/xadrez-treinador/actions/runs/41449660013) passou no HEAD auditado `7fe987e`; conciliação com main e validação humana do modo de sequência/áudio pendentes. Preview não certificada nesta rodada.
- PR #9: Stockfish WASM, áudio e animação. [CI histórica](https://github.com/danielbonavides/xadrez-treinador/actions/runs/43755367335) passou; [workflow do HEAD auditado](https://github.com/danielbonavides/xadrez-treinador/actions/runs/43755387074) ACTION_REQUIRED; causa e reteste Safari/iPhone pendentes. Não promover nem publicar.
- Graphify consultado na main `00d2e4a`; dependências de index.html não retornadas, fallback GitHub. Índice não certifica branches de PR.
- PR #13 documental: candidato a squash, readback/checks finais registrados na própria PR. Sem teste de runtime ou alteração de produção nesta consolidação.

## 4. Próximos gates
| Prioridade | Ação | Aceite |
|---|---|---|
| P0 | Finalizar governança #13 | diff documental, snapshots, readback e squash exclusivo do titular |
| P1 | Conciliar #3 com main | CI real, regressão do modo sequência/áudio, validação humana |
| P1 | Diagnosticar #9 | CI no HEAD final, WASM/Worker reais, Safari/iPhone, regras especiais |
| P1 | Homologar integração em LAB | preservar trainer, histórico, orientação, preferências e versões públicas |

## 5. Continuidade
Atualizar este arquivo integralmente somente na entrega para squash ou pedido expresso, mantendo snapshots históricos. Relatórios e PRs registram evidências e SHA; sem adendos ou URLs de chats privados. Decisão de consolidação de 27/11/2026; referência à discussão privada omitida por sanitização. Estados PASS/PARTIAL/BLOCKED/PENDENTE_READBACK não substituem publicação ou teste real.
