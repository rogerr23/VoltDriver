# Task 015 — API de registro de recargas

## Objetivo

Criar o contrato, a validação, a persistência autenticada e o retorno de métricas para o registro de uma recarga.

## Motivo

Recargas transformam a tarifa configurada em custo real. Registrar kWh e valor pago permite explicar o custo por km, comparar uma recarga pública com a tarifa residencial e alimentar a tarifa média usada pelas jornadas futuras.

## O que foi criado

- Contrato tipado para data, local, tipo, energia carregada e custo total.
- Tipos de recarga do MVP: residencial AC, pública AC, pública DC e outro.
- Validação de datas civis, local, tipo e precisão numérica.
- Leitura de valores decimais com vírgula ou ponto.
- Energia obrigatória e positiva; custo total não negativo para permitir recargas gratuitas.
- Busca autenticada do veículo ativo do motorista.
- Snapshot do consumo do veículo e da tarifa residencial no momento da recarga.
- Cálculo imediato de custo/kWh, custo estimado/km, eficiência configurada, alcance estimado, custo residencial equivalente e economia potencial em casa.
- Server Action autenticada preparada para o formulário de frontend.
- Estado específico quando o motorista ainda não configurou um veículo.

## Decisões

- O local é obrigatório para tornar os custos públicos e residenciais auditáveis no futuro.
- Recarga gratuita é válida e retorna custo por kWh e por km iguais a zero.
- Métricas derivadas não são armazenadas em colunas; podem ser reconstruídas a partir dos dados e snapshots.
- O veículo e o usuário são determinados no servidor, nunca por campos ocultos do formulário.
- Listagem, resumo mensal e edição de recargas ficam para as próximas etapas de agregação e Home.
- Nenhuma tela ou componente visual foi incluído neste commit.

## Arquivos principais

- `src/modules/charging-sessions/domain/charging-session.ts`
- `src/modules/charging-sessions/domain/charging-session.test.ts`
- `src/modules/charging-sessions/server/repository.ts`
- `src/modules/charging-sessions/server/actions.ts`

## Verificações

- Recarga de referência com 34,3 kWh e R$ 41,16.
- Tipos de recarga válidos e recarga gratuita.
- Rejeição de data inexistente, local inválido, tipo desconhecido, energia zero e custo com precisão inválida.
- `pnpm test` — 70 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.

## Commit

`feat(API): add charging session registration`
