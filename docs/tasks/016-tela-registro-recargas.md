# Task 016 — Tela de registro de recargas

## Objetivo

Criar o fluxo mobile-first para registrar uma recarga e receber imediatamente uma explicação clara do custo energético.

## Motivo

O motorista precisa entender rapidamente se uma recarga pública impactou sua rentabilidade e quanto a mesma energia teria custado em casa. A tela reduz esse registro a data, local, tipo, kWh e valor total.

## O que foi criado

- Rota protegida `/recargas/nova`.
- Estado de bloqueio e CTA para configurar o veículo quando necessário.
- Data atual preenchida no fuso `America/Sao_Paulo`.
- Campos para local, tipo de recarga, energia carregada e custo total.
- Seletor tátil para casa/AC, pública/AC, pública/DC e outro.
- Teclados decimal e campos com unidades ou prefixo monetário.
- Botão principal fixo na parte inferior para uso em celular.
- Estado de carregamento durante o cálculo e salvamento.
- Resumo imediato com energia carregada, custo/kWh, custo estimado/km, autonomia estimada e custo residencial equivalente.
- Insight determinístico sobre a economia potencial ao carregar em casa.
- Rolagem automática para o resultado após salvar.
- Acesso à nova tela pela Home inicial.

## Decisões

- O formulário usa o fluxo de entrada em `/recargas/nova`; lista e resumo mensal pertencem à futura Home e não foram antecipados.
- Nenhum tipo de recarga é pré-selecionado para evitar um registro incorreto por padrão.
- A tela mostra a economia potencial apenas quando a recarga custou mais do que o equivalente residencial.
- Usuário, veículo, consumo e tarifa residencial não são campos da interface: vêm da sessão e do servidor.

## Arquivos principais

- `src/app/recargas/nova/page.tsx`
- `src/modules/charging-sessions/ui/charging-session-form.tsx`
- `src/modules/charging-sessions/ui/charging-session-field.tsx`
- `src/app/page.tsx`

## Verificações

- `pnpm test` — 70 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.
- Persistência local confirmada para 34,3 kWh, R$ 41,16, tarifa residencial de R$ 0,65/kWh e consumo de 13,5 kWh/100 km.
- A automação visual não estava disponível nesta sessão; a inspeção de largura de celular permanece para a rodada final de QA do MVP.

## Commit

`feat(FRONTEND): add charging session registration screen`
