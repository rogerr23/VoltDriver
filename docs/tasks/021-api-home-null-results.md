# Task 021 — Robustez dos resultados da Home

## Objetivo

Corrigir a tipagem da consulta da Home para tratar respostas sem registros do Supabase.

## Motivo

O primeiro deploy na Vercel identificou que o SDK do Supabase tipa coleções como potencialmente nulas. A Home já possui estados vazios e, portanto, deve transformar uma ausência de resultados em uma lista vazia antes de calcular indicadores.

## O que foi alterado

- Normalização de `work_sessions` mensal, diário e do período de comparação de `null` para `[]`.
- Normalização de `charging_sessions` mensal de `null` para `[]`.
- Preservação dos cálculos e dos estados vazios existentes: motorista sem lançamentos recebe métricas zeradas, sem exceção e sem erro de TypeScript.

## Arquivo principal

- `src/modules/home/server/queries.ts`

## Verificações

- O erro reportado no build remoto foi analisado: `TS2345` nas agregações de jornadas e recargas.
- `pnpm build` concluído com sucesso após a correção.

## Commit

`feat(API): handle empty home dashboard results`
