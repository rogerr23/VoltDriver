# Task 008 — Schema inicial do Supabase

## Objetivo

Criar a primeira versão reproduzível do banco PostgreSQL do VoltDriver e conectar seu contrato de tipos aos clientes Supabase já existentes.

## Motivo

As próximas APIs precisam de um modelo persistente com validações e isolamento por motorista. Versionar o banco por migration evita configurações manuais no painel e permite reconstruir o mesmo ambiente localmente ou em produção.

## O que foi criado

- Configuração local oficial da CLI em `supabase/config.toml`.
- Migration inicial com as tabelas `profiles`, `vehicles`, `work_sessions`, `charging_sessions` e `monthly_goals`.
- Chaves estrangeiras compostas que impedem associar jornada ou recarga ao veículo de outro usuário.
- Restrições para valores positivos ou não negativos, primeiro dia do mês e listas iniciais de aplicativos e tipos de recarga.
- Índices de consulta por motorista, data e veículo.
- Triggers para atualização automática de `updated_at`.
- Criação automática do perfil após cadastro no Supabase Auth.
- Row Level Security e políticas de acesso aos próprios registros para usuários autenticados.
- Tipos TypeScript iniciais do schema, aplicados aos clientes Supabase do navegador e do servidor.
- Scripts para iniciar, resetar, encerrar e gerar tipos do banco local.
- Teste de contrato para proteger tabelas, RLS, propriedade de veículo e snapshots essenciais.

## Decisões

- Resultados derivados, como lucro e receita por km, não são persistidos; continuam calculados pelo motor financeiro.
- Jornadas e recargas guardam snapshots das tarifas e do consumo usados no cálculo, preservando o histórico.
- Uma constraint parcial garante somente um veículo ativo por usuário.
- O perfil não pode ser excluído diretamente pelo cliente; a futura exclusão da conta deverá partir do fluxo de autenticação.

## Verificações

- `pnpm typecheck`
- `pnpm test` — 30 testes aprovados.
- `pnpm lint`
- `pnpm build`
- `pnpm db:reset` — migration aplicada do zero no PostgreSQL local.
- `pnpm db:lint` — nenhum erro de schema encontrado.

## Commit

`feat(API): add initial database schema`
