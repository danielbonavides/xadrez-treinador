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
