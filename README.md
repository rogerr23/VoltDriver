# VoltDriver

Sistema web mobile-first para motoristas de aplicativo que utilizam veículos elétricos.

O VoltDriver ajuda o motorista a acompanhar receitas, custos de energia, lucro operacional estimado, desempenho por quilômetro e por hora, economia em relação à gasolina e progresso das metas mensais.

## Status

Projeto em fase inicial de construção do MVP. A fundação Next.js, o motor de cálculos, o schema inicial do Supabase e a autenticação server-side estão configurados.

## Stack planejada

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL

## Escopo inicial

- Home com resumo diário e mensal
- Registro de jornadas de trabalho
- Registro e análise de recargas
- Metas mensais
- Configuração do veículo e tarifas

## Documentação

As regras de negócio, entidades, cálculos e plano de implementação estão em [docs/VOLTDRIVER_MVP.md](docs/VOLTDRIVER_MVP.md).

O registro do que foi realizado em cada etapa está em [docs/tasks/README.md](docs/tasks/README.md).

## Desenvolvimento local

Requisitos:

- Node.js 20.9 ou superior
- pnpm 11

Instale as dependências e inicie o servidor:

```bash
pnpm install
pnpm dev
```

Verificações disponíveis:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Supabase

Copie `.env.example` para `.env.local` e informe a URL e a chave publicável disponíveis no painel do projeto Supabase:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Não adicione `.env.local` ou chaves privadas ao Git.

### Autenticação

A base de autenticação usa e-mail e senha com sessões armazenadas em cookies. O Proxy do Next.js renova a sessão, e páginas ou APIs privadas devem chamar `requireAuthenticatedUser()` antes de acessar dados do motorista.

As telas de entrada e cadastro ainda não fazem parte desta etapa.

O schema é versionado em `supabase/migrations`. Para executar o Supabase localmente, mantenha o Docker ativo e use:

```bash
pnpm db:start
pnpm db:reset
pnpm db:lint
```

Após alterar o schema, atualize os tipos TypeScript gerados:

```bash
pnpm db:types
```

Encerre os serviços locais quando terminar:

```bash
pnpm db:stop
```

Este README será atualizado conforme cada etapa do projeto for concluída.
