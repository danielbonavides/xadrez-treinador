# AGENTS.md — XADREZ Treinador

Orientações para agentes responsáveis pelo aplicativo de treino de xadrez.

- Preservar regras de movimentos legais, orientações de tabuleiro, histórico, roque, en passant, promoção, estado e preferências. Alteração de comportamento exige testes apropriados.
- Não incluir PGNs privados, credenciais, tokens ou datasets pessoais na aplicação pública.
- Publicação em GitHub Pages, merge, release e alterações de produção exigem autorização específica; somente documentação e artefatos autorizados entram em branch/PR.

## Protocolo obrigatório — persistência, exportação e readback (PERSISTENCE_PROTOCOL_V1; 2026-11-13)

Aplicar em toda tarefa que gere resultados a conservar fora da sessão: ZIP, CSV, Parquet, matrizes, coordenadas, relatórios, modelos, dados derivados, checkpoints, evidências ou logs de execução. Workspace, `/workspace/`, `.runtime/`, `/tmp/`, sandbox e links internos são **temporários**, nunca entrega persistente comprovada. Saídas descartáveis de testes locais não exigem exportação quando a tarefa não pede sua preservação.

### P0 — destino aprovado e prova de recuperação, ANTES de cálculo pesado

1. Identificar destino privado **especificamente autorizado** pela pessoa responsável, com ID/URL/pasta, escopo permitido de escrita e leitura, controles de acesso e espaço disponível. Não presumir que pasta Windows sincronizada equivale ao acesso do agente na nuvem. Não ampliar permissões nem publicar dados em local público.
2. Criar arquivo de prova não sensível, registrar tamanho e SHA-256, transferir usando o mesmo mecanismo dos resultados finais, **baixar de novo do armazenamento externo** e comparar SHA-256 dos bytes recuperados. Conferir também acesso ao destino pelo executor efetivo (Codex/automação), não apenas pela conta do ChatGPT.
3. Testar limites de upload/download e transporte de arquivos grandes. Planejar partes numeradas, manifesto e remontagem verificada para ZIPs que ultrapassem limites. Confirmar capacidade real, não presumir que metadados ou URL comprovam conteúdo.
4. Sem prova completa: **`BLOCKED_PERSISTENCE`** e parar antes do processamento pesado. Não contornar com push, alteração canônica ou upload para destino não aprovado.

### P1 — checkpoints e retomada idempotente

- Fixar `RUN_ID`, commit/ref de entrada, `PLAN_SHA256`, `INPUTS_SHA256.json`, versões, parâmetros, filtros, seeds, inventário de tarefas e `CONFIG_EXPERIMENTOS.json`. Preservar fontes imutáveis; derivados em diretório isolado.
- Gravar resultados por etapa/experimento com identificador estável; registrar bytes, SHA-256, schema, contagens e erros. Escrever arquivos completos antes de `DONE.json`; finalização atômica quando possível.
- Publicar checkpoints versionados ao destino aprovado após cada lote pequeno (referência: 10–20 experimentos) ou segmento significativo. Rebaixar o gate e suspender novos cálculos se exportação/readback falhar.
- Na retomada, verificar todos os arquivos esperados e seus hashes, não só presença de `DONE.json`. Reexecutar somente etapas ausentes ou corrompidas, em staging isolado; não sobrescrever checkpoint válido. Registrar `CHECKPOINT_CORRUPT` e divergências.

### P2 — entrega verificável

- Gerar `CHECKSUMS_SHA256.txt` e manifesto com `RUN_ID`, origem, nomes, tamanhos, SHA-256, cobertura, exceções, destino externo e instruções de recuperação. Evitar referências circulares de checksum.
- Ler cada membro de ZIP e validar integridade. Após transferência, baixar novamente artefatos/partes, recompor quando aplicável, comparar SHA-256 com origem e registrar `ZIP_READBACK.json` **fora** dos ZIPs.
- Status separados: `PASS_COMPUTE` (processamento local), `PASS_EXPORT_PERSISTENCE` (cópia externa verificada), `PARTIAL` (cobertura/limitações científicas), `BLOCKED_PERSISTENCE` (prova inicial ausente), `BLOCKED_EXPORT` (cálculo pronto, entrega externa não verificada) e `DIVERGENCIA_RECONSTRUCAO` (desvio documentado). Conclusão só após `PASS_EXPORT_PERSISTENCE` quando há entrega persistente.
- Entregar link real de armazenamento aprovado, manifesto, hashes e readback. Não declarar sucesso com caminho interno, URL não verificada ou somente `zipfile.testzip()`.

### Autorizações e precedência

- Nada neste protocolo autoriza, por si, push, merge, deploy, credenciais, alterações de canônicos, compartilhamento, sobrescrita, exclusão ou escrita em Drive/Notion/outros serviços. Cada destino e ação relevante exigem escopo autorizado. Fluxos de branch/PR já autorizados para desenvolvimento seguem regras deste repositório; não servem de fallback para exportação de dados.
- Preservar proibições e políticas de segurança específicas deste repositório. Havendo conflito, aplicar regra mais restritiva e registrar bloqueio. Não inserir dados pessoais, jogos privados, segredos, tokens ou artefatos volumosos no Git sem autorização explícita e validação de segurança.
- Em homologação somente leitura, não criar prova externa nem alterar sistemas. Relatar destino pendente e solicitar autorização antes de qualquer escrita.
