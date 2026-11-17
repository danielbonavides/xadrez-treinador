# PERSISTENCE_PROTOCOL_V1.3 (2026-11-13) — XADREZ Treinador

Movido de `AGENTS.md` em 17/11/2026, sem alteração de conteúdo. Normativo quando houver artefato que precise sobreviver à sessão; o resumo e a regra de aplicação ficam em `AGENTS.md`.

**Container efêmero. Arquivo não exportado e recuperável = perdido.** Caminhos `/workspace/`, `/home/`, `/tmp/`, `.runtime/`, sandbox e links internos não são persistência. Aplica-se a resultados científicos, modelos, ZIPs, matrizes, relatórios e checkpoints que devem sobreviver à sessão; não a saídas descartáveis de testes.

### Destinos permanentes: somente escopos explicitados

**Sem destino de dados científicos privados autorizado para este repositório público.** Não enviar ZIPs, PGNs, matrizes ou dados do jogador ao Git. Desenvolvimento web mantém fluxo já estabelecido; qualquer armazenamento externo novo exige autorização registrada por projeto.

**Capacidade é específica da ferramenta, conta, sessão e rota de transporte.** Não generalizar limites de upload a partir de uma falha isolada. Testar o canal efetivo com arquivo pequeno e verificar o readback antes de executar trabalho pesado. Quando o canal não suportar o volume necessário, registrar `BLOCKED_PERSISTENCE` e solicitar um destino explicitamente autorizado; nunca improvisar destino público para dados privados. Não transportar artefatos grandes como base64 pelo contexto da conversa.

### P0 — prova antes de computação pesada

1. Confirmar ID/URL e permissões do destino fixo; não exigir nova aprovação se projeto, artefato e operação já cobertos por autorização permanente. Verificar acesso **pelo executor efetivo**, não apenas no ChatGPT. Destino não declarado continua sem autorização.
2. Executar teste mínimo de ida e volta: **arquivo pequeno, upload, download independente e SHA-256 idêntico**. Para rota Git de grandes, fazer teste efetivo de `git push` na branch permitida, seguido de `git fetch`/`git clone` em diretório limpo e SHA-256 idêntico, antes de processar dados pesados. Confirmar que credencial e permissão funcionam no container real; testar capacidade de transferência sem colocar ZIPs no contexto.
3. Falha: `BLOCKED_PERSISTENCE`. **Parar somente computação pesada**; leitura, auditoria, planejamento, código e testes leves seguem. Não improvisar outra conta, repo público ou destino não autorizado.

### P1 — checkpoints recuperáveis e retomada

- Fixar `run_id`, `exp_id` estável, hashes dos inputs/planos/parâmetros, ambiente, versões, seeds e filtros. Escrever dados derivados em staging isolado; preservar canônicos.
- Persistir checkpoint **a cada 10–20 experimentos OU 30 minutos, o que ocorrer primeiro**. Para experimento longo, salvar estado parcial se suportado; caso não, registrar início e persistir assim que concluir.
- Manter `manifest.csv` versionado com colunas mínimas **`exp_id,params_sha256,status,result_sha256,timestamp`**, adicionando `run_id`, nome de arquivo, tamanho, ID/link externo e checksum da parte quando aplicável.
- Finalizar resultado local antes de marcar `status=ok`. Enviar lote/manifesto imutável ao destino autorizado. Durante checkpoints, checagem leve de presença, ID, tamanho e checksum remoto **se efetivamente exposto** pelo provedor (por exemplo, `md5Checksum`). Para Git, registrar SHA do blob/commit e SHA-256 calculado da parte. Metadado não substitui readback de bytes.
- `status=ok` no manifesto só quando conteúdo correspondente tem comprovação suficiente de persistência no destino (readback anterior, checksum independente verificável ou gate próprio explícito). Caso contrário, usar `PENDING_READBACK`; não pular experimento na retomada com hash não conferido.
- Retomada lê `manifest.csv` **do destino externo** e verifica `exp_id`, `params_sha256`, `status`, localização e checksum. Pular apenas experimentos válidos; `CHECKPOINT_CORRUPT` para partes ausentes/incompatíveis; recalcular somente o necessário. Falha de persistência durante execução: parar novos cálculos pesados e registrar `BLOCKED_EXPORT`.

### P2 — entrega final e readback real

- Gerar `SHA256SUMS` e manifesto com arquivos, parâmetros, tamanho, SHA-256, origem, cobertura, exceções e procedimento de recuperação. Validar membros de ZIP. Se usar Git, `split -b 90m` em partes numeradas; manter cada blob estritamente abaixo de 100 MB, observando custo/tamanho total do repositório.
- Exportar por canal autorizado **fora do contexto conversacional**. Executar readback completo de destino externo: `git clone`/`git fetch` em área nova no caso Git, ou download real do Drive quando aplicável. Conferir SHA-256 de **todas as partes**; remontar e comparar SHA-256 do ZIP original. Salvar `ZIP_READBACK.json` separado.
- `PASS_COMPUTE` = só cálculo. `PASS_EXPORT_PERSISTENCE` = conteúdo final recuperado e verificado. `BLOCKED_PERSISTENCE` = pré-condição falhou; `BLOCKED_EXPORT` = exportação/readback final falhou; `PARTIAL` = limitação científica; `DIVERGENCIA_RECONSTRUCAO` = divergência documentada. Não declarar entrega com URL sem bytes conferidos.

### Segurança e precedência

- Destinos permanentes acima não autorizam merge, deploy, mudanças de Production, publicação pública, exclusão, sobrescrita de canônicos, credenciais ou dados fora do projeto. Não fazer `git push --force`; evitar alteração de arquivos de código ao publicar partes, usar caminho dedicado e commits incrementais. Não colocar segredos, tokens, PGNs brutos ou dados pessoais não explicitamente autorizados no Git.
- Preservar regras locais de branch, CI e segurança. Homologações expressamente somente leitura seguem somente leitura. O `AGENTS.md` na branch de PR só passa a reger a `main` após merge; para Codex numa branch diferente, fornecer essas instruções diretamente ou atualizar aquela branch por fluxo autorizado.
