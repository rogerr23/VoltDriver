# Task 018 — Tela de metas mensais

## Objetivo

Entregar uma tela mobile-first para configurar e acompanhar as metas de receita, quilômetros e economia do mês atual.

## Motivo

O motorista precisa saber em poucos segundos o que já realizou, o que ainda falta e se o ritmo atual é suficiente para o mês. A tela concentra essa leitura sem transformar o planejamento em um dashboard complexo.

## O que foi criado

- Rota protegida `/metas`.
- Cabeçalho, navegação de retorno e ação de saída consistentes com as outras telas privadas.
- Resumo do mês atual com média diária de receita necessária e dias de calendário restantes.
- Cards grandes de receita, quilômetros e economia, com realizado, alvo, percentual, barra de progresso e saldo.
- Estado claro para metas não configuradas e para metas já atingidas ou superadas.
- Formulário compacto para uma, duas ou três metas, com teclado decimal, unidades e valores atuais preenchidos.
- Botão principal fixo na área inferior para facilitar o uso em celular.
- Acesso à tela pela Home inicial.

## Decisões

- O progresso vem do servidor e é baseado apenas nas jornadas do mês, evitando uma segunda fonte de cálculo no cliente.
- Barras visuais param em 100%, mas o texto informa quando uma meta foi superada.
- Campos em branco são enviados como meta não configurada; ao menos um campo deve receber valor maior que zero.
- Não foi criada navegação de histórico de meses, lista de metas ou gráficos: esses itens serão avaliados depois da validação do MVP.

## Arquivos principais

- `src/app/metas/page.tsx`
- `src/modules/monthly-goals/ui/monthly-goal-form.tsx`
- `src/modules/monthly-goals/ui/monthly-goal-field.tsx`
- `src/app/page.tsx`

## Verificações

- Revisão estática dos estados de interface, mensagens, acessibilidade de campos e responsividade pela composição mobile-first.
- `git diff --check`.
- Por solicitação do usuário, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` e a inspeção visual automatizada foram adiados para a validação após a Task 20.

## Commit

`feat(FRONTEND): add monthly goals screen`
