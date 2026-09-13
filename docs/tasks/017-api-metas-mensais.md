# Task 017 — API de metas mensais

## Objetivo

Criar o contrato, a validação, a persistência autenticada e a consulta do progresso das metas do mês atual.

## Motivo

As metas só são úteis quando traduzem as jornadas em receita, distância e economia realizadas. Esta API entrega uma fonte única para configurar metas e calcular esse progresso sem antecipar a Home agregada.

## O que foi criado

- Contrato tipado para metas de receita, quilômetros e economia.
- Validação de decimais com vírgula ou ponto e valores não negativos.
- Exigência de pelo menos uma meta maior que zero, igual à regra do banco.
- Upsert autenticado para uma única meta por motorista no mês atual.
- Mês calculado no servidor com o fuso `America/Sao_Paulo`; ele não vem de campo oculto.
- Consulta das jornadas do mês atual e reconstrução dos totais com os snapshots históricos de consumo e tarifas.
- Progresso de receita, km e economia usando o motor de cálculos já existente.
- Média diária de receita necessária, incluindo o dia atual na contagem restante.
- Server Action para salvar a configuração e revalidar Home e Metas.

## Decisões

- Um alvo igual a zero significa que aquela dimensão não foi configurada; por isso não há percentual nem saldo artificial para ela.
- Se a economia acumulada for negativa, o valor financeiro continua disponível para a Home, mas o progresso da meta usa piso de zero.
- As metas só configuram o mês vigente nesta etapa. Histórico, troca de mês e edição de meses anteriores entram em uma task futura.
- O cálculo de economia usa os snapshots da jornada, em vez da configuração atual do veículo, para manter o histórico correto.
- Métricas de progresso são derivadas em leitura; não são duplicadas no banco.
- Nenhuma interface foi incluída neste commit.

## Arquivos principais

- `src/modules/monthly-goals/domain/monthly-goal.ts`
- `src/modules/monthly-goals/server/repository.ts`
- `src/modules/monthly-goals/server/queries.ts`
- `src/modules/monthly-goals/server/actions.ts`

## Verificações

- Revisão estática do contrato, limites, regras de mês e caminhos de revalidação.
- `git diff --check`.
- Por solicitação do usuário, `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm build` foram adiados para a validação após a Task 20.

## Commits

`feat(API): add monthly goals persistence`

`feat(API): harden home goal progress`
