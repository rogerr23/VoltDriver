# VoltDriver

Sistema web mobile-first para motoristas de aplicativo que utilizam veículos elétricos.

O VoltDriver ajuda o motorista a acompanhar receitas, custos de energia, lucro operacional estimado, desempenho por quilômetro e por hora, economia em relação à gasolina e progresso das metas mensais.

## Status

Projeto em fase inicial de construção do MVP. A fundação técnica, o motor de cálculos, o schema inicial, a autenticação e os fluxos completos de veículo, jornada, recargas e metas mensais estão preparados.

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

As telas mobile-first estão disponíveis em `/entrar` e `/cadastro`.

### Configuração do veículo

A API valida e salva o veículo ativo do motorista, incluindo consumo, autonomia, tarifas de energia e referências de gasolina.

A tela protegida mobile-first está disponível em `/veiculo`. Ela permite cadastrar ou editar a configuração, aceita números decimais com vírgula ou ponto e mostra o resultado do salvamento no próprio formulário.

### Jornadas

A API de jornadas valida data, aplicativo, distância, horas, minutos, ganho bruto e gorjeta. Ao salvar, usa a configuração ativa do veículo, aplica a média ponderada das recargas disponíveis até a data da jornada — ou a tarifa residencial como fallback — e preserva os parâmetros em snapshots históricos.

A tela protegida mobile-first está disponível em `/jornadas/nova`. Após o registro, ela apresenta imediatamente receita total, rendimento por km, lucro por hora, consumo e custo de energia, lucro operacional estimado, economia contra gasolina e eficiência.

### Recargas

A API de recargas valida data, local, tipo, kWh e custo total. Ela usa o veículo ativo do motorista, preserva snapshots de consumo e tarifa residencial e retorna custo por kWh, custo estimado por km, autonomia estimada e a diferença para carregar a mesma energia em casa.

A tela protegida mobile-first está disponível em `/recargas/nova`. Depois de salvar, ela apresenta custo/kWh, custo estimado/km, autonomia estimada e a comparação com a tarifa residencial.

### Metas mensais

A API de metas salva uma configuração por motorista para o mês atual, com metas de receita, quilômetros e economia. O progresso é reconstruído pelas jornadas registradas com os snapshots históricos de cada uma, preservando a coerência dos valores mesmo quando o veículo ou as tarifas forem alterados depois.

A tela protegida mobile-first está disponível em `/metas`. Ela mostra o progresso de cada objetivo, o saldo restante e a média diária de receita necessária para atingir a meta mensal.

### Home

A consulta da Home reúne jornadas, recargas e metas do motorista para o dia e mês atuais. Ela calcula os indicadores com os snapshots históricos das jornadas, compara o lucro/hora com o mesmo período já decorrido no mês anterior e produz insights determinísticos para a interface.

A rota protegida `/` é a Home mobile-first do produto. Ela prioriza receita e lucro de hoje, oferece acesso imediato ao registro de jornada e organiza métricas diárias, meta de receita, resumo mensal, recargas e insights em uma única rolagem.

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
