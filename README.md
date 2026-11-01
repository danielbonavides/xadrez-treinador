# XADREZ — Treinador Web (v1.1.3)

**Status: PRODUÇÃO HOMOLOGADA — 31/10/2026.**

**Abrir no iPhone / Safari:** https://danielbonavides.github.io/xadrez-treinador/

Site estático publicado pelo GitHub Pages (branch `main`, raiz), com 240 posições de treino.

- Site e exercícios são **públicos**: não há login nem controle de acesso.
- A versão pública remove informações identificadoras de partidas individuais (URLs, datas, IDs e nomes de usuário originais).
- As posições FEN e sugestões de lances ficam disponíveis a qualquer visitante.
- O progresso é salvo no `localStorage` do navegador, **sem sincronização entre dispositivos**.
- Sem backend, n8n, Cloudflare ou bibliotecas externas via CDN.
- Para novas versões, preservar IDs `EX0001`–`EX0240` e adicionar exercícios a partir de `EX0241`.
- Repositório de engenharia, documentação e análises: `danielbonavides/XADREZ` (**privado**).

## Homologação

O titular confirmou no iPhone o acesso pelo Safari, os movimentos das peças e a persistência do progresso após a publicação; o atalho “XADREZ — Treinador pessoal” foi adicionado à Tela de Início. O script de publicação confirmou HTTPS e a presença de `EX0240`. A integração GitHub confirmou a existência de 240 IDs de exercício e que o repositório original permanece privado.

Esta é a versão estável de referência; novas alterações devem preservar os dados já salvos no Safari. O registro técnico detalhado está no repositório privado `XADREZ`, em `docs/HOMOLOGACAO_XADREZ_WEB_V1_1_3_PRODUCAO_20261031.md`.
