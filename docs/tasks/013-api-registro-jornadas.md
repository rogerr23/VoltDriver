# Task 013 — API de registro de jornadas

## Objetivo

Criar o contrato, a validação e a persistência autenticada para registrar uma jornada e devolver imediatamente suas métricas calculadas.

## Motivo

A jornada é a principal unidade de valor do VoltDriver. Antes do formulário mobile, o servidor precisa garantir que dados inválidos não sejam persistidos, que os parâmetros venham do veículo do próprio motorista e que os resultados históricos permaneçam explicáveis.

## O que foi criado

- Contrato tipado para data, aplicativo, distância, tempo online, ganho bruto e gorjeta.
- Lista fechada de aplicativos do MVP: Uber, 99, InDrive e Outros/Múltiplos.
- Conversão de horas e minutos para minutos totais.
- Leitura de valores decimais com ponto ou vírgula.
- Validação conjunta dos campos, incluindo datas civis reais e jornada entre 1 minuto e 24 horas.
- Gorjeta opcional com valor padrão zero.
- Busca autenticada do veículo ativo do motorista.
- Consulta das recargas do veículo com data menor ou igual à data da jornada.
- Tarifa residencial como fallback quando ainda não existem recargas aplicáveis.
- Média ponderada por kWh quando existe histórico de recargas.
- Snapshot da tarifa aplicada, consumo do veículo, gasolina e eficiência do carro de referência.
- Persistência da jornada com vínculo composto entre usuário e veículo.
- Cálculo imediato de receita, consumo, custo de energia, lucro operacional estimado, rendimentos, economia e eficiência.
- Server Action autenticada com retorno preparado para a futura tela de confirmação.
- Estado específico quando o motorista ainda não configurou um veículo.

## Decisões

- Tempo online é recebido como horas e minutos, evitando interpretar `8,30` de forma ambígua como hora decimal.
- A tarifa média ponderada considera somente recargas do veículo ativo e ignora recargas posteriores à jornada.
- A tarifa calculada é normalizada para quatro casas decimais antes do cálculo e da persistência, acompanhando a precisão do banco.
- Métricas calculadas não são duplicadas em colunas: elas podem ser reconstruídas a partir das entradas e snapshots.
- A identidade e o veículo nunca são aceitos do formulário; ambos são derivados da sessão autenticada.
- Edição, exclusão e listagem de jornadas permanecem fora desta task.
- Nenhum componente ou página de frontend foi incluído neste commit.

## Arquivos principais

- `src/modules/work-sessions/domain/work-session.ts`
- `src/modules/work-sessions/domain/work-session.test.ts`
- `src/modules/work-sessions/server/repository.ts`
- `src/modules/work-sessions/server/actions.ts`

## Verificações

- Valores da jornada de referência de 27/07/2026.
- Conversão de 8 horas e 12 minutos para 492 minutos.
- Aplicativos válidos e rejeição de aplicativo desconhecido.
- Gorjeta e parcela de minutos opcionais.
- Rejeição de data inexistente, distância zero, valores monetários inválidos e tempo fora do limite.
- `pnpm test` — 62 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.
- Teste integrado no Supabase local com dois usuários.
- Fallback residencial de R$ 0,65/kWh confirmado sem histórico de recargas.
- Média ponderada de R$ 0,98/kWh confirmada com duas recargas; recarga posterior ignorada.
- Snapshots e métricas da jornada persistida conferidos.
- Leitura de jornadas de outro usuário e vínculo com o veículo dele bloqueados pelo RLS e pela chave estrangeira composta.

## Commit

`feat(API): add work session registration`
