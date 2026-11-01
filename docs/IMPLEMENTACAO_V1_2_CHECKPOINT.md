# XADREZ Web v1.2 — Checkpoint de implementação

**Estado:** PR #2 em rascunho; NÃO publicado.
**Baseline produção:** v1.1.4 (main); não houve merge neste ciclo.
**Branch:** `feat/web-v1.2-visual-progress`

## Recursos implementados

- Temas escuro, clássico e claro; preferência independente em `xadrez_web_theme_v1`.
- Ajustes de interface e controles mobile.
- Peças representadas com elementos SVG locais (glifos tipográficos dentro de SVG; não biblioteca própria de paths).
- Seta de último lance na sobreposição do tabuleiro, calculada conforme orientação Brancas/Pretas.
- Importação de backup de tentativas JSON, conciliada por chave determinística e sem apagar histórico. Exportação permanece disponível.
- Áudio original e chave `xadrez_web_sound_enabled_v1` mantidos.
- Histórico original `xadrez_v1_attempts` preservado.

## Verificação realizada

- 11/11 verificações estáticas PASS, incluindo sintaxe JavaScript, seleção de temas, importação, overlay SVG e presença de 240 identificadores EX.
- Nenhum teste em Safari/Chromium/WebKit ou simulação de importação executado neste checkpoint.
- Verificações estáticas NÃO equivalem a aprovação funcional.

## Testes de homologação ainda necessários

1. Abrir candidata isolada e trocar temas, recarregar e conferir preferência.
2. Inspecionar SVGs em Safari iOS (legibilidade de peças pretas/brancas).
3. Confirmar setas de movimento, inclusive tabuleiro invertido.
4. Exportar histórico e importar backup em ambiente isolado: sem duplicar nem apagar tentativas.
5. Regressão motor: legalidade dos 240 exercícios e movimentos especiais (roque, en passant, promoções).
6. Conferir som, histórico e compatibilidade mobile.
7. Compatibilidade: backups legados não têm event_id. A conciliação preserva a maior multiplicidade observada de registros idênticos; não pode provar a identidade de eventos iguais entre backups diferentes. Novos registros passam a receber event_id para idempotência.

**Parecer:** GO para revisão técnica/execução de testes na branch; NO-GO para merge/publicação.

## Regressão direcionada — 01/11/2026

Correção no commit `6425bc61`: novos registros recebem `event_id` e timestamp UTC. A importação de backups legados preserva multiplicidade de tentativas iguais, e a importação de novos backups deduplica por `event_id`.

**9/9 verificações executáveis em JavaScript e invariantes estruturais PASS:** sintaxe; duas tentativas legadas iguais; idempotência legado; IDs novos distintos; ID novo repetido; importação mista; chaves áudio/histórico preservadas; 240 identificadores. Testes executados em JavaScript isolado, **não** em Safari/Chromium. Risco residual: backups legados sem IDs não permitem identificar inequivocamente tentativas iguais provenientes de fontes independentes.

**Critérios de homologação visual no iPhone:** alternar 3 temas e recarregar; verificar legibilidade das peças SVG nas duas cores; confirmar seta do último lance com Brancas e Pretas; exportar backup antes de importar; conferir que importação mantém tentativas e repetir importação não aumenta contagem. Recomenda-se testar importação em perfil/dispositivo descartável até completar testes de navegador automatizados.

## Homologação visual iPhone — 01/11/2026

O titular confirmou seis testes humanos PASS, sem observações negativas: (1) carregamento da v1.2 no Safari; (2) alternância dos temas; (3) peças legíveis; (4) seta após lance; (5) orientação da seta com Pretas; (6) persistência do tema depois de reabrir.

**Parecer:** GO visual restrito aos cenários humanos executados. Não constitui homologação da importação JSON nem regressão integral. A homologação foi feita no caminho `/teste-v1.2/`, que usa `xadrez_v1_2_test_attempts` isolado. A branch de entrega usa `xadrez_v1_attempts` original, preservado. A diferença intencional de chaves deve ser considerada ao comparar comportamentos.

**Gate mínimo antes de merge:** testar exportação, importação, reimportação idempotente e conservação da multiplicidade de tentativas em ambiente de teste; confirmar comportamento de erro de arquivo e quota de armazenamento. Preservar a v1.1.4 em produção e não alterar histórico real para teste.

## Testes direcionados da importação — 01/11/2026

Commit da correção: `214aefca48f7f71b73b876e4d39577322bc53799`.

O handler de importação foi executado em JavaScript com seleção de arquivo e armazenamento simulados. Resultados:

| Caso | Evidência | Resultado |
| --- | --- | --- |
| Backup válido | 0→1 registros; 1 escrita | PASS |
| Reimportação idempotente | 1→1; 0 escritas | PASS |
| Duas tentativas legadas iguais | 1→2, preservando multiplicidade | PASS |
| Tentativa inválida | 1→1; 0 escritas | PASS |
| Armazenamento sem quota | 1→1 em memória e storage simulado; erro reportado | PASS |
| Sintaxe JavaScript | Código integral analisado por parser JS | PASS |

Preview isolada `teste-v1.2/index.html` sincronizada com o código corrigido; chaves próprias `xadrez_v1_2_test_attempts`, `xadrez_web_sound_test_v1_2` e `xadrez_web_theme_test_v1_2`. Testes HTML/DOM reais em Safari ainda não executados. Visual no iPhone: 6/6 PASS reportados pelo titular, antes da sincronização corretiva limitada à importação.

**Parecer:** GO para preparar publicação da candidata; para o merge final, recomenda-se somente um smoke test no endereço isolado: exportar arquivo, importá-lo, importar outra vez e observar contagem estável. Não repetir a homologação visual aprovada.
