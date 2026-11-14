# AGENTS.md — XADREZ Treinador

Orientações para agentes responsáveis pelo aplicativo de treino de xadrez.

- Preservar regras de movimentos legais, orientações de tabuleiro, histórico, roque, en passant, promoção, estado e preferências. Alteração de comportamento exige testes apropriados.
- Não incluir PGNs privados, credenciais, tokens ou datasets pessoais na aplicação pública.
- Publicação em GitHub Pages, merge, release e alterações de produção exigem autorização específica; somente documentação e artefatos autorizados entram em branch/PR.

## Persistência obrigatória — PERSISTENCE_PROTOCOL_V1.2 (2026-11-13)

**Container efêmero. Arquivo não exportado = perdido.** `/workspace/`, `/home/`, `/tmp/`, `.runtime/` e link interno não comprovam persistência. Este protocolo vale para artefatos que precisam sobreviver à sessão (dados derivados, resultados, matrizes, ZIPs, checkpoints e relatórios). Saídas descartáveis de testes locais não exigem backup. Não pressupor acesso de Codex Cloud a pasta Windows sincronizada.

### Destinos autorizados

**Nenhum destino de dados científicos privados autorizado para este repositório público.** Proibido enviar ZIPs, PGNs, matrizes de usuário ou resultados privados por `git push` ou Git LFS. Regras atuais de desenvolvimento e publicação do treinador permanecem; se tarefa precisar de armazenamento externo novo, registrar destino em atualização autorizada de `AGENTS.md` antes de computação pesada.

Autorização permanente **restrita a destino, projeto, branch, classificação de dados e operações aqui declaradas**; não pedir de novo dentro desse escopo. Nunca publicar dados em repositório público. Não incluir segredos, credenciais, tokens, PGNs brutos ou dados pessoais não autorizados. Git LFS só se já configurado e comprovado; caso contrário, usar partes pequenas. Limite de parte no Git não elimina custo ou crescimento do histórico.

### P0 — prova de ida e volta antes de computação pesada

1. Identificar o destino **do executor efetivo** (Codex/automação), verificar permissões e espaço; não confundir capacidade do conector ChatGPT com capacidade de transferência direta do container Codex.
2. Criar prova pequena sem dados sensíveis; enviar ao destino configurado, **recuperar independentemente**, comparar SHA-256 e tamanho. Para Git, testar push e fetch/clone de uma referência de prova no branch autorizado. Confirmar mecanismo de transferência dos arquivos grandes (push direto do container, Git LFS habilitado, ou partes de 90 MiB), sem trafegar ZIPs como base64 pelo contexto.
3. Se falhar: `BLOCKED_PERSISTENCE`; **interromper só computação pesada**. Permitir leitura, auditoria, planejamento, código e testes pequenos sem gerar dados difíceis de recuperar. Não improvisar destino, ampliar permissões nem alterar canônicos.

### P1 — checkpoints e retomada

- Registrar `run_id`, commit/fonte de entrada, versões, hashes de inputs, configuração, filtros, seeds e inventário de experimentos. Usar `exp_id` estável.
- Checkpoint **a cada 10–20 experimentos OU 30 minutos, o que vier primeiro**, inclusive execução individual longa: persistir estado parcial retomável quando tecnicamente suportado; quando algoritmo não permitir checkpoint interno, registrar progresso antes de iniciar e exportar logo ao concluir. Não esperar horas sem registrar progresso verificável.
- Manter `manifest.csv` com colunas mínimas **`exp_id,params_sha256,status,result_sha256,timestamp`**. Acrescentar `run_id`, arquivo/caminho remoto, bytes, schema e observações quando disponíveis.
- Gravar arquivos completos, verificar SHA-256 local e publicar checkpoint versionado/imutável. `status=ok` somente após transferência confirmada. Nos checkpoints intermediários, aceitar verificação leve: tamanho + checksum remoto (`md5Checksum` do Drive quando disponível, ou identificador/hash remoto do Git); **não confundir metadados com readback de bytes**. Quando nenhum verificador remoto confiável existir, registrar `PENDING_READBACK`, não `PASS_EXPORT_PERSISTENCE`.
- Retomada: ler `manifest.csv` **do destino externo**, validar `exp_id`, `params_sha256`, status, referência e hash/bytes; pular somente experimentos com `status=ok` e evidência consistente. Artefato ausente/corrompido: `CHECKPOINT_CORRUPT`, recalcular só esse experimento; não sobrescrever checkpoint íntegro.
- Falha de transferência durante execução: parar **novos cálculos pesados**, preservar dados locais disponíveis e reportar `BLOCKED_EXPORT`.

### P2 — entrega final e readback

- Produzir manifesto final, `SHA256SUMS`/`CHECKSUMS_SHA256.txt`, contagens, entradas, configurações, cobertura e exceções. Validar membros dos ZIPs e partes numeradas. Para partes GNU usar `split -b 90m`, com cada parte abaixo de 100 MB e SHA-256 próprio.
- Após exportar, **baixar de novo do armazenamento externo** os arquivos finais; reconstruir ZIPs divididos, verificar SHA-256 integral contra origem, registrar `ZIP_READBACK.json` separado. Readback completo obrigatório ao final; checkpoints intermediários podem usar verificação leve.
- `PASS_COMPUTE` não equivale a entrega. Marcar `PASS_EXPORT_PERSISTENCE` somente após readback final íntegro. Na falha prévia: `BLOCKED_PERSISTENCE`; se cálculo concluído mas exportação/readback falhou: `BLOCKED_EXPORT`. Preservar `PARTIAL` para limitações científicas e `DIVERGENCIA_RECONSTRUCAO` para divergências documentadas.

### Segurança e precedência

- Este contrato não autoriza merge, deploy, produção, compartilhamento público, exclusão, sobrescrita de canônicos ou alteração de credenciais. Respeitar regras existentes de branch/PR, segurança e CI: aplicar sempre restrição mais forte. **Push para guardar dados não equivale a push de código** e só é permitido quando declarado expressamente acima.
- Homologação estritamente somente leitura continua sem escrita. Se ambiente ativo não tiver conectores/canais necessários, declarar bloqueio específico e preservar trabalho leve. Não substituir prova real por plano.
