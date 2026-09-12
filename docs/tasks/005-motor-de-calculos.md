# Task 005 — Motor de cálculos

- Status: concluída
- Data: 2026-09-11
- Camada: API
- Commit: `feat(API): add business calculation engine`

## Objetivo

Implementar e validar as regras matemáticas centrais do VoltDriver antes de conectá-las ao banco ou à interface.

## Motivo

Jornadas, recargas, metas e a Home dependem das mesmas fórmulas. Centralizá-las em funções puras evita divergências entre frontend e backend e permite testar o domínio sem infraestrutura externa.

## Entregas

- Cálculos básicos de energia, custo, gasolina equivalente, lucro operacional estimado e economia.
- Cálculo completo de jornada.
- Cálculo de recarga e comparação com tarifa residencial.
- Tarifa média ponderada pelo histórico de recargas, com fallback residencial.
- Consolidação de jornadas por período usando os totais.
- Progresso de metas e média diária necessária.
- Erros de domínio para entradas inválidas.
- Testes automatizados com Vitest.

## Arquivos principais

- Criado: `src/modules/finance/domain/calculations.ts`.
- Criado: `src/modules/finance/domain/calculations.test.ts`.
- Atualizados: `package.json`, `pnpm-lock.yaml` e `README.md`.
- Atualizado: `docs/tasks/README.md`.

## Decisões técnicas

- As funções mantêm precisão integral; arredondamento pertence à apresentação.
- Divisões sem denominador válido retornam `null`, evitando zeros enganosos.
- O lucro calculado nesta fase é operacional estimado e não inclui manutenção.
- A consolidação calcula indicadores pelos totais do período, não pela média simples das jornadas.

## Verificações

- Reconciliação dos valores de energia, gasolina e economia de julho de 2026.
- Validação da jornada de 27/07/2026.
- Casos de tarifa residencial e pública.
- Casos de meta ausente, em andamento, atingida e encerrada.
- Entradas inválidas e divisões por zero.
- `pnpm test`.
- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm build`.
