# Relatório PASS/FAIL/SKIP — Homologação Stockfish 240 × Web v1.4

**Handoff:** HOF-XWEB-1.2-STOCKFISH240-v1.0  
**Branch:** `feat/web-v14-stockfish240-homolog-20261102-r2`  
**Base:** `feat/web-v1.4-adaptive`  
**GitHub Actions:** [run 41378568989](https://github.com/danielbonavides/xadrez-treinador/actions/runs/41378044851)

## Artefatos auditáveis

- [Contrato normalizado](../stockfish-240/CONTRATO_NORMALIZADO.md)
- [Tabela de junções 240/240](TABELA_JUNCOES_240.csv)
- [Registro das 68 divergências](DIVERGENCIAS_G5_STOCKFISH_68.csv)
- [Diff da branch contra a v1.4](https://github.com/danielbonavides/xadrez-treinador/compare/feat/web-v1.4-adaptive...feat/web-v14-stockfish240-homolog-20261102-r2)

## Resultados

| Verificação | Resultado |
|---|---:|
| Schema raiz e privacidade | PASS |
| Junções por ID/FEN/ply/lado/G5 | 240/240 PASS |
| Variantes PV reproduzidas com R88 | 960/960 PASS |
| python-chess: FEN e sugestão legal | 240/240 PASS |
| Divergências G5 × Stockfish | 68 — confirmadas, não classificadas como erros |
| Contratos Node adaptativos + UI + integração | 44/44 PASS |
| Testes sintéticos/contrato do adaptador | 19/19 PASS |
| JSON ausente/malformado | PASS — treinamento preservado |
| Registro ausente/duplicado/FEN/ply/G5 divergentes | PASS — isolamento por exercício |
| Importação local e persistência | PASS — sem escrita pelo adaptador |
| Scheduler, estágios, intervalos e fila | PASS — invariantes nos testes |
| Preview determinística e baseline v1.2 | PASS |

## SKIP / pendências

- Safari/iPhone físico: SKIP — homologação humana ainda necessária.
- Merge, deploy e release: SKIP — não autorizados nesta etapa.
- Diagnóstico tático certificado: SKIP — não implementado nem inferido.

## Parecer

**GO para homologação técnica da branch. NO-GO para merge/release até concluir a verificação humana Safari/iPhone.** A `main`, o HTML v1.2, o histórico de treino, o TESTE3 e as bases originais não foram alterados.
