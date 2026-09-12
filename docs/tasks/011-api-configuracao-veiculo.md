# Task 011 — API de configuração do veículo

## Objetivo

Criar o contrato, a validação, a leitura e o salvamento da configuração do veículo ativo do motorista.

## Motivo

Consumo energético, tarifas de recarga, preço da gasolina e eficiência do veículo de referência alimentam os cálculos de jornadas, recargas e economia. Esses parâmetros precisam ser confiáveis antes da implementação dos fluxos financeiros.

## O que foi criado

- Contrato tipado da configuração do veículo.
- Estado de resposta preparado para uso com `useActionState` na futura interface.
- Leitura de valores decimais com ponto ou vírgula.
- Validação conjunta dos sete campos obrigatórios.
- Rejeição de valores vazios, zerados, negativos, não numéricos ou incompatíveis com a precisão do banco.
- Consulta do veículo ativo com retorno de zero ou um registro.
- Criação do primeiro veículo ou atualização do veículo ativo existente.
- Filtros por usuário e veículo nas atualizações.
- Server Action autenticada que deriva o usuário exclusivamente da sessão.
- Revalidação das rotas afetadas após o salvamento.
- Consulta autenticada reutilizável para Server Components.
- Testes com os valores de referência do BYD Dolphin Mini.

## Decisões

- O formulário nunca fornece `user_id`; a identidade vem de `requireAuthenticatedUser()`.
- O MVP edita um único veículo ativo em vez de criar versões duplicadas a cada alteração.
- Os valores são persistidos sem formatação monetária e sem arredondamento de apresentação.
- Erros internos do banco são registrados no servidor, mas a interface recebe uma mensagem segura e genérica.
- Nenhuma tela ou componente visual foi incluído neste commit de backend.

## Arquivos principais

- `src/modules/vehicles/domain/vehicle.ts`
- `src/modules/vehicles/domain/vehicle.test.ts`
- `src/modules/vehicles/server/repository.ts`
- `src/modules/vehicles/server/queries.ts`
- `src/modules/vehicles/server/actions.ts`

## Verificações

- Conversão dos valores de referência com vírgula e ponto.
- Normalização do nome do veículo.
- Rejeição de entradas inválidas e reporte conjunto dos campos.
- `pnpm test` — 53 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.
- Teste integrado no Supabase local com dois usuários: criação e leitura pelo proprietário aprovadas; leitura e atualização pelo segundo usuário bloqueadas pelo RLS.

## Commit

`feat(API): add vehicle configuration persistence`
