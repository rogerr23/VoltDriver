# Task 019 — API da Home

## Objetivo

Criar a consulta autenticada que consolida os indicadores da Home para hoje, o mês atual e um período anterior comparável.

## Motivo

Os dados já podem ser registrados, mas ainda estão dispersos. A Home precisa de uma fonte única que apresente o resultado do trabalho sem recalcular regras no cliente ou depender da configuração atual do veículo.

## O que foi criado

- Contrato tipado para os dados agregados da Home e os insights determinísticos.
- Leitura autenticada das jornadas de hoje, do mês atual e do mesmo intervalo já decorrido no mês anterior.
- Reconstrução de receita, lucro, energia, economia, R$/km e R$/hora com os snapshots de cada jornada.
- Consolidação de energia e custo pago nas recargas do mês.
- Progresso de metas de receita, distância e economia, com média diária necessária.
- Comparação percentual de lucro por hora contra o período anterior comparável.
- Insights para meta mensal, valor restante, ritmo diário, lucro/hora e custo de recargas.
- Tratamento de períodos sem jornadas ou sem metas, sem criar divisão por zero.

## Decisões

- O período comparável vai do primeiro dia até o mesmo dia do mês anterior; quando esse dia não existe no mês anterior, usa-se o último dia disponível.
- As recargas mostram o valor efetivamente pago no mês, enquanto o lucro estimado mantém o custo energético atribuído às jornadas. São métricas diferentes e complementares.
- Insights são regras determinísticas e curtas, sem IA generativa.
- A Home visual fica para a Task 020; nenhum componente de interface foi incluído aqui.

## Revisão antes da Task 020

- A estrutura foi comparada novamente com as abas `Home` e `Dashboard` da planilha de referência.
- Receita, lucro, custo energético, economia, km, eficiência, horas e as três metas estão disponíveis no contrato para a interface.
- Gráficos de seis meses, manutenção, relatórios e score geral continuam fora por decisão explícita do escopo do MVP.
- A comparação de lucro por hora passou a tratar variações inferiores a 0,5% como estáveis, evitando a mensagem incorreta “caiu 0%”.

## Arquivos principais

- `src/modules/home/domain/home-dashboard.ts`
- `src/modules/home/server/queries.ts`

## Verificações

- Revisão estática das faixas de datas, agregações, estados sem dados e regras de insights.
- `git diff --check`.
- Por solicitação do usuário, `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm build` foram adiados para a validação após a Task 20.

## Commits

`feat(API): add home dashboard aggregation`

`feat(API): refine home dashboard insights`
