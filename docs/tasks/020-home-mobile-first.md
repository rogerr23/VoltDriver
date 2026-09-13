# Task 020 — Home mobile-first

## Objetivo

Substituir a página provisória pela Home autenticada do VoltDriver, usando os dados consolidados na Task 019.

## Motivo

A Home é a principal resposta do produto para “como está meu trabalho hoje e neste mês?”. Ela precisa priorizar as decisões do motorista em uma tela pequena e tornar o registro de jornada a ação mais rápida.

## Revisão da referência visual

- As abas `Home` e `Dashboard` da planilha foram renderizadas e revisadas antes da implementação.
- Foram preservados o fundo escuro, a divisão por blocos, os cards financeiros, as metas e os acentos elétricos em verde, ciano, violeta e âmbar.
- A hierarquia foi adaptada para celular: hoje e ação principal vêm antes dos indicadores mensais.
- O Dashboard separado foi consolidado na Home, conforme a especificação do MVP.
- Gráficos de seis meses, manutenção, relatórios e score geral não foram reproduzidos, pois estão fora do escopo desta primeira versão.

## O que foi criado

- Home protegida e alimentada pela consulta autenticada da Task 019.
- Cabeçalho compacto com identidade VoltDriver, data e saída da conta.
- Card principal com receita e lucro operacional estimado de hoje.
- CTA destacado `+ Registrar Jornada` imediatamente após o resultado principal.
- Cards de km, receita/km, lucro/hora e economia contra gasolina.
- Progresso mensal de receita, valor restante ou excedente e média diária necessária.
- Resumo mensal compacto de receita, lucro, km, horas, economia e custo energético atribuído às jornadas.
- Resumo do custo efetivamente pago em recargas, kWh e preço médio por kWh.
- Até três insights determinísticos prioritários.
- Navegação inferior para Início, Recargas, Metas e Veículo.
- Estados vazios para motorista sem meta, sem jornadas ou sem recargas.
- Correção da tela de metas para exibir alvo zero como não configurado.

## Decisões

- Receita por km e lucro por hora permanecem métricas distintas, de acordo com as regras de negócio.
- “Custo de energia” das jornadas e “valor pago em recargas” aparecem em blocos separados porque representam fatos diferentes.
- A barra de meta limita a largura visual a 100%, mas mantém percentual e excedente reais no texto.
- A navegação aponta Recargas para o formulário atual, pois a listagem ainda não existe no MVP construído.
- Não foram adicionados gráficos ou animações que dificultem a leitura rápida dentro do carro.

## Arquivos principais

- `src/app/page.tsx`
- `src/modules/home/ui/home-dashboard.tsx`
- `src/modules/home/ui/bottom-navigation.tsx`
- `src/modules/home/ui/dashboard-icon.tsx`

## Verificações

- Revisão visual das abas `Home` e `Dashboard` do arquivo `EV_DRIVER_OS_preenchida.xlsx`.
- Revisão estática da hierarquia, estados vazios, links, unidades e composição responsiva mobile-first.
- `git diff --check`.
- Por solicitação do usuário, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` e execução local do projeto não foram realizados nesta task.

## Commit

`feat(FRONTEND): add mobile-first home dashboard`
