# Task 014 — Tela de registro de jornadas

## Objetivo

Criar o fluxo mobile-first para registrar uma jornada e apresentar imediatamente os resultados calculados pela API.

## Motivo

A jornada é a principal ação do VoltDriver. O motorista precisa informar o total do seu período de trabalho com poucos toques e receber uma resposta clara sobre faturamento, energia, lucro e economia sem navegar para outro relatório.

## O que foi criado

- Rota protegida `/jornadas/nova`.
- Data atual preenchida conforme o fuso `America/Sao_Paulo`.
- Seletor tátil para Uber, 99, InDrive e Outros/Múltiplos.
- Campos de quilômetros, horas, minutos, ganho bruto e gorjeta opcional.
- Teclados numérico e decimal adequados em dispositivos móveis.
- Unidades e prefixos monetários visíveis dentro dos campos.
- Botão principal fixo na área inferior durante o preenchimento.
- Estado de carregamento enquanto a jornada é calculada e salva.
- Bloqueio orientativo com acesso direto à configuração quando não existe veículo ativo.
- Resumo imediato com receita, lucro operacional estimado, R$/km, lucro/hora, energia, custo, economia e eficiência.
- Explicação da origem da tarifa usada no cálculo: histórico de recargas ou fallback residencial.
- Rolagem automática para o resumo após o salvamento.
- Limpeza do formulário após uma jornada salva, mantendo a data atual pronta para o próximo registro.
- CTA principal `+ Registrar Jornada` na Home inicial.

## Decisões

- O formulário representa uma sessão de trabalho completa, não uma corrida individual.
- Horas e minutos são campos visuais separados para evitar ambiguidade com horas decimais.
- Nenhum aplicativo vem pré-selecionado, reduzindo o risco de salvar a plataforma errada por padrão.
- O resumo usa `lucro operacional estimado`, pois manutenção e outros custos continuam fora do MVP.
- A página carrega o veículo no servidor e só envia ao cliente o formulário; identidade, veículo e parâmetros de cálculo não ficam em campos editáveis.
- Histórico, edição e exclusão de jornadas continuam fora desta task.

## Arquivos principais

- `src/app/jornadas/nova/page.tsx`
- `src/modules/work-sessions/ui/work-session-form.tsx`
- `src/modules/work-sessions/ui/work-session-field.tsx`
- `src/app/page.tsx`

## Verificações

- Estado sem veículo com CTA para `/veiculo`.
- Configuração do BYD Dolphin Mini pelo fluxo autenticado.
- Jornada de referência de 27/07/2026 registrada com 152,8 km, 8h12, R$ 310,18 e R$ 1,92 de gorjeta.
- Persistência confirmada com 492 minutos e snapshot de R$ 0,65/kWh.
- Receita total exibida: R$ 312,10.
- Rendimento exibido: R$ 2,04/km.
- Consumo estimado exibido: 20,63 kWh.
- Custo de energia exibido: R$ 13,41.
- Lucro operacional estimado exibido: R$ 298,69.
- Economia contra gasolina exibida: R$ 61,59.
- Eficiência exibida: 7,41 km/kWh.
- Layout validado em 390 × 844 px e 320 × 800 px.
- Nenhum overflow horizontal em 320 px.
- Nenhum erro ou aviso registrado no console do navegador.
- `pnpm test` — 62 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.

## Commit

`feat(FRONTEND): add work session registration screen`
