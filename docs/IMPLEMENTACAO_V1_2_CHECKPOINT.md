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
7. Revisar política de importação: tentativas idênticas historicamente repetidas podem ser semanticamente distintas. O deduplicador atual é por conteúdo, não por ID de evento; não promover até decidir o modelo de identidade das tentativas.

**Parecer:** GO para revisão técnica/execução de testes na branch; NO-GO para merge/publicação.
