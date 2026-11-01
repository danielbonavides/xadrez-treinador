# XADREZ — Treinador Web (v1.1.3)

Site estático para GitHub Pages com 240 posições de treino de xadrez.

- Site e base de exercícios são **públicos**; não há login nem controle de acesso.
- A versão pública retira nomes de usuário, URLs, datas e IDs originais das partidas.
- As posições FEN e as sugestões de lances continuam disponíveis a qualquer visitante.
- O progresso é salvo no `localStorage` do navegador, sem sincronização entre dispositivos.
- O site não usa serviços externos, n8n ou bibliotecas carregadas de CDN.
- Para novas versões, preserve os IDs `EX0001`–`EX0240`; acrescente novos exercícios a partir de `EX0241`.
- O treinador pessoal completo e o código de análise permanecem no repositório privado original.

A publicação exige habilitar GitHub Pages no repositório de destino, com fonte **Deploy from a branch → `main` → `/ (root)`**.
