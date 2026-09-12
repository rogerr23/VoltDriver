# Task 001 — Análise do produto e especificação do MVP

- Status: concluída
- Data: 2026-09-11
- Camada: Projeto
- Commit: `cec5e37 docs(PROJECT): define MVP and commit strategy`

## Objetivo

Analisar a planilha de referência e o escopo antes de iniciar o desenvolvimento do VoltDriver.

## Motivo

Os indicadores financeiros dependem de definições consistentes. A análise foi necessária para separar consumo estimado de energia carregada, esclarecer o conceito de jornada e evitar que inconsistências da planilha fossem copiadas para o sistema.

## Entregas

- Interpretação do produto e definição do escopo do MVP.
- Identificação das entidades principais.
- Proposta do modelo de dados.
- Definição das fórmulas canônicas.
- Estrutura inicial das páginas.
- Reconciliação dos valores de julho de 2026.
- Registro das inconsistências e decisões recomendadas.
- Plano de implementação dividido em tasks pequenas.
- Convenção de commits por camada.

## Arquivos

- Criado: `docs/VOLTDRIVER_MVP.md`.

## Decisões principais

- Jornada de trabalho é a unidade principal, não corrida individual.
- Energia consumida e energia carregada são métricas diferentes.
- O MVP usa “lucro operacional estimado”, pois manutenção está fora do escopo.
- A Home concentra o resumo; não haverá um Dashboard redundante no MVP.

## Verificações

- Inspeção das nove abas da planilha.
- Leitura de fórmulas, intervalos e nomes definidos.
- Reconciliação de receita, km, horas, energia, economia e lucro de julho de 2026.
- Revisão do documento e validação do diff.
