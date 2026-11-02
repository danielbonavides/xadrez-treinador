# XADREZ Web v1.4 adaptativa — entrega F1–F4 para homologação

Data de referência: 01/11/2026 (America/Sao_Paulo).

**Parecer: GO para preview e revisão do PR; NO-GO para merge/release.**
A homologação humana Safari/iPhone real está pendente. Nenhum merge, deploy de GitHub Pages ou troca da página de produção foi realizado.

## Base e escopo

- Repositório: `danielbonavides/xadrez-treinador`.
- Branch: `feat/web-v1.4-adaptive`, baseada na `main` v1.2, commit `415eac86061f18c9bc31af36321a829b7b605cc5`.
- Blob Git de `index.html`: `2b3990a71c0a42cd29b7adbed3a95f5bc9afef3b`, conferido antes da implementação e por teste de regressão. `index.html` e `teste-v1.2/index.html` permanecem intactos.
- Requisitos consultados: arquitetura e contratos v0.1 de 01/11/2026 no repositório canônico privado. Não se copia conteúdo privado para esta entrega pública.
- A autorização do usuário cobre implementação e correções internas F1–F4, branch, PR draft e preview isolada. Não cobre release.

## Entrega

`adaptive/core.js` contém ExerciseCatalog, LegacyAttemptAdapter, AdaptiveScheduler, QueueBuilder, AttemptRecorder e o limite seguro do futuro PedagogyAdapter. O catálogo conserva os 240 IDs, FENs e sugestões G5. Fingerprints SHA-256 são gerados no build, conforme `id + "\n" + fen + "\n" + melhor_uci`. O mapa legado fica fixado na revisão v1.2 auditada, evitando transferir programação após mudança de FEN/sugestão.

O scheduler é puro, usa UTC injetado e deriva todo o estado do histórico. Alternativa legal implica 15 minutos; coincidências G5 sucessivas implicam 24/72/168/336/720 horas. Sem data não há vencimento. Datas inválidas/futuras, inconsistências, revisões incompatíveis e conflitos de identidade são excluídos da programação sem apagar registros. Empates temporais preservam índice estável da fonte.

A preview está em `teste-v1.4/index.html`, gerada a partir do HTML v1.2 pelos scripts em `tools/` e `adaptive/`. Filtros de modalidade/fase/cor valem para fila e indicadores. O modo misto utiliza cadência configurável, por padrão dois vencidos para cada novo. Legado sem data entra no grupo explicitamente denominado “Novos / legado sem programação”, sem ser contado como acervo não visto. Fila vazia nunca força movimento ou cria tentativa. “Revisões realizadas” conta reobservações datadas válidas após a primeira observação de cada exercício.

Gravação ocorre antes de confirmar persistência. Falha de quota mantém tentativa em memória, com aviso, exportação e botão de nova tentativa. JSON ilegível não é sobrescrito: backup inclui o texto bruto disponível e a sessão não salva. Import é transacional no setItem, concilia por event_id/multiplicidade e rejeita conflitos de event_id. Preferências não são restauradas silenciosamente. Antes de cada gravação o store é relido; não há promessa de sincronização/merge concorrente entre dispositivos ou abas com escrita simultânea.

## Isolamento e preview

Preview hospedada isolada, privada por padrão, com login ChatGPT do proprietário:

https://xadrez-v14-preview-daniel.humble-hill-3632.chatgpt.site/teste-v1.4/

O serviço Sites hospeda uma cópia de homologação em origem separada; isso não constitui publicação definitiva da v1.4 nem altera GitHub Pages. A versão inicial hospedada foi confirmada como `succeeded`. O manifesto e credenciais da hospedagem ficam fora deste repositório; nenhum segredo faz parte do diff.

Chaves exclusivas de testes, sem leitura/migração automática do store de produção:

| Dado | Chave |
| --- | --- |
| Tentativas | `xadrez_v1_attempts_test_v1_4` |
| Preferências | `xadrez_v1_4_preferences_test_v1` |
| Tema | `xadrez_web_test_v1_4_theme` |
| Áudio | `xadrez_web_test_v1_4_sound` |

A chave histórica `xadrez_v1_attempts` da v1.2 permanece preservada. Para homologar histórico real, exportar da v1.2 e importar explicitamente uma cópia na preview. O envelope mantém `puzzles_tentados` top-level; teste executa o importador original v1.2 contra o backup novo. Não se persiste uma segunda verdade de estágio. Para eventual release futuro, ligar o recorder à chave canônica e preferências de produção exigirá mudança explícita, nova homologação e autorização de release; esta entrega mantém a configuração de testes.

## Auditoria Stockfish

O handoff HOF-XWEB-1.2-STOCKFISH240-v1.0 foi lido na branch canônica indicada. O ZIP de evidências não está disponível nesta missão. Não foram incorporadas PVs, CPs novos, afirmações de tática ou diagnósticos. Os números 172/68 reportados no handoff não foram verificados independentemente e não são usados na programação, classificação ou indicadores.

“Análise Stockfish (experimental)” permanece opt-in, fechado por padrão, informando ausência de evidências. O PedagogyAdapter rejeita dados não validados e também não ativa diagnóstico somente com flags, pois o contrato final do payload ainda depende da futura integração. F5 e implementação do painel MultiPV completo não fazem parte desta v1.4. O treino funciona sem JSON e sem rede depois que HTML e scripts locais carregam; não foi acrescentado service worker nem garantia de reload offline.

## Validação e reprodução

Na raiz do checkout:

```text
node tools/build-adaptive.cjs
node --test tests/adaptive.test.cjs tests/ui.test.cjs
python tests/catalog_oracle.py
```

O oráculo usa `python-chess`/`chess` instalado ou a dependência local da sessão; CI instala `python-chess==1.999`. JS não requer instalação. O workflow só testa: não publica Pages e não faz deploy.

| Grupo | Resultado local | Evidência/limite |
| --- | --- | --- |
| T01 catálogo | PASS | 240 IDs distintos, SHA-256, sugestões legais no R88; 240/240 FENs válidas e sugestões legais no python-chess 1.11.2 |
| T02 scheduler | PASS | Sem eventos, intervalos, teto 30 dias, datas nulas/inválidas/futuras, replay, revisão incompatível |
| T03 semântica | PASS | Alternativa legal neutra; sugestão/ilegal/tema/áudio sem tentativa |
| T04 persistência | PASS | Quota, memória/export/retry, JSON corrompido, byte preservation antes da escrita, refresh, IDs, multiplicidade e importador v1.2 |
| T05 UI Chrome | PASS direcionado | Entrada, gravação, revisão 24h, fila vazia, Pretas, seta G5 sem tentativa, tema; largura 390×844 |
| T05 Safari/iPhone real | PENDENTE | Aceite humano necessário; Chrome móvel simulado não substitui Safari real |
| T06 integração opcional | PASS ausência/rejeição; SKIP payload certificado | Nenhum payload de engine validado disponível; F5 separado |
| T07 reprodutibilidade/integridade | PASS direcionado | Pureza, isolamento, baseline, build determinístico e nenhum fetch de engine; reload offline não prometido |

Suíte local: **27 testes, 27 PASS, 0 FAIL**. Inclui integração dos scripts reais da preview em DOM mínimo; não se apresenta esse teste como teste de Safari. Regressões de motor cobrem captura, roque, en passant, promoção e segurança do rei. O código do motor/tabuleiro v1.2 foi reutilizado.

Evidência visual móvel: [preview-v14-mobile.png](preview-v14-mobile.png).

## Roteiro humano mínimo

1. Abrir a preview no Safari do iPhone com a conta autorizada. Confirmar banner de testes e zero histórico inicial, sem importar automaticamente dados da v1.2.
2. Testar Novos, Revisões e Misto, cadências e filtros Live/Daily, fase e Brancas/Pretas. Confirmar fila vazia sem criação de eventos.
3. Jogar uma coincidência e uma alternativa legal; verificar linguagem neutra e programação. Mostrar sugestão não deve alterar indicadores.
4. Conferir toque nas casas, rotação e seta nas Pretas, tema, som ligado/desligado e promoção se houver posição apropriada.
5. Exportar backup, recarregar, importar duas vezes; verificar idempotência e persistência. Importar uma cópia de backup v1.2 com legado sem data; conferir ausência de datas inventadas.
6. Voltar à v1.2 publicada e conferir que histórico, tema e áudio anteriores permanecem. Registrar navegador/versão, data e PASS/FAIL antes de propor release.

## Rollback e parecer

Produção não recebeu alteração, portanto rollback imediato consiste em voltar à URL v1.2. Baseline recuperável pelo commit acima; não executar reset/force-push em main. Descartar ou suspender a preview pode ser feito posteriormente sem apagar histórico de produção. Manter backups exportados de testes se forem úteis à homologação.

**GO_PREVIEW / GO_DRAFT_REVIEW / NO_GO_MERGE_RELEASE.** F1–F3 implementadas e verificadas; F4 entrega preview, regressões e roteiro, com aceite humano real ainda pendente. Nenhuma fonte PGN/G4/G5, TESTE3, HOLD/holdout ou main foi alterada. A seleção adaptativa continua exploratória e não mede Accuracy oficial nem força enxadrística.
