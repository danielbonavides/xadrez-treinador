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


## Homologação humana Safari/iPhone — aceite recebido em 01/11/2026

O titular executou o roteiro na prévia isolada e reportou **8/8 PASS**, sem falhas ou observações pendentes:

| Caso | Resultado informado |
| --- | --- |
| Página abre, banner de testes e sem importação automática de histórico | PASS |
| Modos Novos, Revisões e Misto | PASS |
| Filtros e cadência alteram a fila | PASS |
| Coincidência G5 programa revisão; alternativa legal não é erro certificado | PASS |
| Mostrar sugestão não registra tentativa | PASS |
| Toques, orientação Pretas, seta, tema e som | PASS |
| Backup exporta, importa e reimporta sem duplicação | PASS |
| v1.2 preserva histórico e preferências originais | PASS |

**Parecer atualizado:** `GO_HUMAN_HOMOLOGATION` para os cenários efetivamente executados na prévia Safari/iPhone; somado a `GO_PREVIEW` e `GO_DRAFT_REVIEW`. **Continua `NO_GO_MERGE_RELEASE`** por instrução expressa do titular: não realizar merge, alterar `main` ou publicar definitivamente sem autorização explícita de release.

Nenhuma correção foi identificada a partir dos resultados humanos reportados. Os testes automatizados (27/27), oráculo python-chess (240/240), CI e testes Chrome permanecem como evidências anteriores, sem serem reexecutados nesta homologação. A confirmação de que a v1.2 preservou histórico e preferências é resultado do teste humano reportado, não uma nova leitura do dispositivo.

**Próximo estado permitido:** PR #3 permanece aberto em rascunho, branch `feat/web-v1.4-adaptive` isolada. A homologação está concluída para a candidata; merge e release aguardam autorização expressa.


## F5 — adaptador experimental opcional (implementação parcial)

Foi criado `adaptive/stockfish-f5.js` e acrescentado o painel de leitura em `teste-v1.4/index.html`. A ausência de dados devolve aviso neutro; não há alteração no motor de revisão, histórico, indicadores G5 ou preferências. O gerador de prévia `tools/build-adaptive.cjs` e os fragmentos de origem foram atualizados, com testes em `tests/stockfish-f5.test.cjs`.

**Validação executada neste chat:** 7/7 verificações do adaptador em JS isolado PASS (dados ausentes, contrato sintético, ID divergente, UCI raiz ilegal, alegação indevida de diagnóstico certificado, linhas malformadas, mensagem explícita de experimentalidade). A sintaxe JS do HTML da preview passou. `main/index.html` permanece inalterado. Os testes Node/CI da branch após as alterações F5 não foram executados nem certificados neste chat.

**Limite de integração:** o pacote real `XADREZ_HANDOFF_WEB12_STOCKFISH_240_20261101.zip` (SHA-256 declarado `be8c4c21250c0497e2fce69c0670e62e71f0f4ba743ad8b52d69b4057daf`) não está disponível para leitura/verificação nesta execução. Não houve processamento dos 240 registros reais nem certificação da legalidade integral das PVs. Para PVs de mais de um lance, o adaptador exige flag explícita `legal_moves_verified` do produtor; validação independente da linha inteira segue como pendência de pipeline offline. A versão real do schema `xadrez.pedagogia.v1.3` permanece sujeita a validação contra o pacote, que pode exigir ajustes no parser.

**Publicação:** o arquivo de preview na branch foi alterado, mas a cópia hospedada anteriormente no Sites não foi redeployada por esta execução. `GO_ADAPTER_SCAFFOLD` / `NO_GO_REAL_DATA_ACTIVATION` / `NO_GO_MERGE_RELEASE`. Próximo passo obrigatório: recuperar ZIP, validar schema e PVs, executar testes Node e CI, reconstruir/republicar apenas preview isolada e homologar o novo painel; sem repetir os 8 testes já aprovados da v1.4 quando código dessas funções permanecer idêntico.


## F5 — recuperação parcial de pacote e validação local (01/11/2026)

Recuperados diretamente dos artefatos oficiais GitHub Actions os lotes EXP235 (run 41365886179, artifact 13106759083) e PILOT5 (run 41365566369, artifact 13106808459). São os **dois artefatos de origem**, não o ZIP consolidado do handoff (SHA declarado be8c4c...). CRC dos dois ZIPs passou.

Foi gerado localmente um pacote público derivado com 240 documentos `public_candidate`, excluindo conteúdos de `private/`. Auditoria sintática: 240 IDs únicos EX0001–EX0240, 240 posições com FEN, 240×4 raízes de linhas (MultiPV1/2, human_forced, g5_forced), 240 schemas `xadrez.pedagogia.v1.3`, 68 primeiros lances MultiPV1 diferentes do G5, 0 conflitos nos checks sintáticos e whitelist negativa de campos privados. **Não houve rechecagem independente da legalidade completa das PVs** nesta execução (biblioteca python-chess indisponível no container); `quality.legal_moves_verified` provém do produtor.

Novo painel com importação explícita do JSON público 240 via arquivo local: nenhum envio ao servidor nem alteração do histórico. Valida 240 IDs únicos e o contrato de cada exercício antes de habilitar o conjunto. Preview branch `teste-v1.4/index.html` atualizada e compilação sintática JS PASS. A hospedagem ChatGPT Sites previamente publicada **não foi atualizada automaticamente**; exige novo deploy da cópia isolada para disponibilizar o uploader remoto.

Os testes focados do adaptador tiveram 7/7 PASS antes do uploader; suíte CI da alteração F5 deve ser verificada independentemente. Nenhum merge/release autorizado. `GO_PUBLIC_DATA_RECOVERED` / `GO_BRANCH_PREVIEW_CODE` / `NO_GO_HOSTED_PREVIEW_UPDATED` / `NO_GO_MERGE_RELEASE`.


## F5 — Carregamento automático público em subpasta GitHub Pages (02/11/2026)

Após autorização expressa do titular para usar GitHub Pages apenas para a prévia, foi publicado **somente** o conjunto de arquivos da prévia e sua dependência pública em `main/teste-v1.4/` e `main/adaptive/`. A página raiz `main/index.html` (v1.2) conserva o blob auditado `2b3990a71c0a42cd29b7adbed3a95f5bc9afef3b`. O PR #3 continua aberto e em draft, não mergeado. A mudança em `main` é restrita ao caminho da prévia, não um release de v1.4.

Fonte: arquivo público derivado dos artefatos oficiais de 5 + 235 exercícios; versão minimizada sob `teste-v1.4/stockfish-240-public.json` (251.474 bytes; excluídos `guidance`, `motifs`, `nodes`, quaisquer `private/*`, URLs e dados pessoais). Registros: 240 únicos, schema `xadrez.pedagogia.v1.3`, IDs/FEN/ply/G5 consistentes com o catálogo v1.2, flags de pesquisa, 960 PV completas e 8.360 lances reproduzidos legalmente com R88. A validação R88 é a engine JavaScript existente; não é uma nova certificação independente pela biblioteca python-chess ou nova execução Stockfish.

Implementação: a prévia carrega automaticamente `./stockfish-240-public.json` com `window.fetch` do mesmo domínio e `credentials:'omit'`, sem salvar evidências no storage e sem interferir no `AttemptRecorder` ou `AdaptiveScheduler`. O carregador manual continua como fallback. Todo o pacote é validado antes de ativar as 240 entradas. O painel continua experimental, com a mensagem de que divergências não certificam erros.

Testes de execução em ambiente JavaScript isolado com HTML e módulos reais: 240/240 carregados automaticamente, primeiro exercício renderizado com 4 linhas, nenhuma tentativa escrita e sentinela de produção preservada. O build reproduziu byte a byte `teste-v1.4/index.html`. Testes adicionados ao repositório para fluxo automático/404 e PVs 960/960. **A última CI da branch, após esses testes novos, ainda não foi confirmada nesta sessão**; os resultados antigos de CI não equivalem a uma execução da nova revisão. Leitura de conferência no GitHub confirmou `main` com arquivos de prévia idênticos aos da branch e produção v1.2 intacta. **GitHub Pages HTTP/Safari ao vivo não pôde ser alcançado por esta ferramenta**, exigindo confirmação humana de atualização e carregamento na URL.

Estado: `GO_PRIVACIDADE_DADOS_PUBLICOS`, `GO_CODIGO_AUTOLOAD`, `GO_PREVIEW_MAIN_FILES`, `PENDENTE_CI_ULTIMO_COMMIT`, `PENDENTE_HTTP_SAFARI`, `NO_GO_MERGE_RELEASE`.


## F5 — aceite humano do carregamento automático na prévia GitHub Pages (02/11/2026)

**Confirmação recebida do titular nesta conversa:** a interface da prévia exibiu a descrição atualizada de F5, a indicação explícita "240 análises Stockfish carregadas automaticamente. Dados experimentais, sem diagnóstico certificado." e a análise do exercício atual com **Stockfish 19 / profundidade 10** e quatro sequências UCI. Exemplo reportado: primeira linha `d5d6` com `+7,92` peões POV jogador, segunda `c1h6` com `+6,72`, linha forçada histórica `e1g1` com `+4,43` e linha G5 `d5d6` com `+7,92`. A primeira linha e a linha forçada G5 podem coincidir; **não são quatro melhores lances distintos**.

**Parecer atualizado:** `GO_F5_AUTOLOAD_USUARIO` — URL pública da prévia acessível ao usuário, pacote completo carregado automaticamente e variantes renderizadas. O retorno comprova o funcionamento desse fluxo no navegador utilizado, mas não constitui inspeção independente do navegador nem repetição dos oito casos funcionais da v1.4. A prévia ainda identifica os dados como pesquisa, sem certificar erros ou táticas. A suíte posterior à mudança foi **CI PASS 37/37 JS, build reprodutível, oráculo python-chess PASS** na execução [41435009360](https://github.com/danielbonavides/xadrez-treinador/actions/runs/41435009360). Os avisos de CI/HTTP pendentes das seções anteriores são históricos e ficam superados no escopo do autoload confirmado por este registro.

**Governança preservada:** v1.2 segue em `main/index.html`; versão de testes permanece em `main/teste-v1.4/`, dados públicos em `main/teste-v1.4/stockfish-240-public.json`, PR #3 aberto Draft e **não mergeado**. `NO_GO_MERGE_RELEASE` permanece válido até autorização expressa de release. Futuro aprimoramento meramente de interface: identificar separadamente as quatro variantes (`MultiPV #1/#2`, `lance humano forçado`, `G5 forçado`), evitar aparência de quatro recomendações independentes e apresentar notação enxadrística legível sem alterar os dados ou regras.


## F6 — Sequências de três lances do jogador (02/11/2026)

Novo modo opcional **"3 lances seus"** implementado sem substituir o modo "1 lance". O exercício contém exatamente **três decisões do titular + duas respostas automáticas do adversário**; a resposta não é escolhida por IA em tempo real: vem da linha G5 forçada de pesquisa Stockfish, em até cinco meios-lances legalmente reproduzidos. O painel F5 foi aprimorado para rotular explicitamente MultiPV 1/2, linha histórica e continuação G5 com setas de origem/destino.

Auditoria do dataset público derivado (240 candidatos): **227 sequências disponíveis** (PV G5 forçada com pelo menos cinco meios-lances), **13 indisponíveis** sem inventar jogadas ou trocar por linha MultiPV não-G5. Motor `adaptive/sequence-3.js` é puro/testável; valida ID/FEN/ply/G5, status experimental, legalidade de todos os cinco meios-lances; falha fechada se ausente/inválido. O usuário joga os plies 1/3/5 e o adversário reproduz os 2/4. Lance legal diferente da variante encerra a tentativa como **"desvio"**, nunca como "erro certificado". O botão "Mostrar sugestão" revela somente o próximo lance, sem consumi-lo ou contar tentativa. Reiniciar restaura a posição; promoção, roque, captura e xeque utilizam as regras já auditadas do R88.

**Isolamento histórico:** cada sessão concluída ou desviada gera **um** evento `xadrez.sequence_attempt.v1` armazenado somente sob `xadrez_v1_4_sequences_test_v1`. `xadrez_v1_attempts_test_v1_4` e `xadrez_v1_attempts` não recebem eventos de sequência, mantendo o agendador G5 invariável. Backup v1.4 passou a conter `sequence_attempts` e importação idempotente separada por `event_id`. Em falha de gravação, a interface avisa e mantém fallback de backup da sessão, sem sobrescrever os dados de produção.

**Verificações executadas:** o JavaScript gerado da prévia passou na verificação sintática; o roteiro runtime com scripts reais e 240 evidências públicas carregadas testou três decisões seguidas, duas respostas automáticas, conclusão, uma tentativa no armazenamento isolado, **zero** registros novos G5 e sentinela de produção intacta. Testes adicionais `tests/sequence3.test.cjs` cobrem elegibilidade 227/240, execução das cinco jogadas legais, desvio, ausência de linhas e dica; `tests/ui.test.cjs` cobre integração com UI, feedback, dica e isolamento.

**Escopo de publicação:** apenas pasta `teste-v1.4/` e script público `adaptive/sequence-3.js`, sem merge nem alteração de `main/index.html`. CI e aceitação humana do novo modo devem ser reportadas explicitamente; não herdar PASS anteriores para funcionalidade nova.


### F6 — Publicação isolada e CI final

A prévia compilada `teste-v1.4/index.html` (blob `07e42533da3f2ad1f627ac34413a9652c96fc2ea`) e scripts `adaptive/sequence-3.js` e `adaptive/stockfish-f5.js` foram publicados com sucesso como **arquivos isolados em `main`**, sem incorporar a branch e sem tocar no arquivo raiz v1.2. Os 240 registros Stockfish públicos mantêm o mesmo arquivo já homologado. Na prévia, o formato inicial continua "1 lance" até o titular selecionar "3 lances seus".

**CI final da branch: PASS**, [GitHub Actions #41440214434](https://github.com/danielbonavides/xadrez-treinador/actions/runs/41440214434): **44/44 testes JavaScript**, `build-adaptive.cjs` reprodutível, oracle `python-chess` aprovado, sem falhas. Inclui testes em todas as 227 sequências G5 de cinco meios-lances, testes da interface e tratamento de desvio legal, além de regressões F1–F5. A verificação do arquivo publicado na main confirmou `index.html` com blob original `2b3990a71c0a42cd29b7adbed3a95f5bc9afef3b`, PR #3 mantido **Draft e não mergeado**.

Estado `GO_F6_TESTS_44_44` / `GO_F6_PREVIEW_SOURCE` / `PENDING_HUMAN_SAFARI_F6` / `NO_GO_MERGE_RELEASE`. Não tratar disponibilização dos arquivos como certificação de acesso HTTP do GitHub Pages; solicitar teste humano de 3 lances no Safari.
