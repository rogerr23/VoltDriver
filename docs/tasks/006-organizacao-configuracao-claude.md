# Task 006 — Organização da configuração do Claude

- Status: concluída
- Data: 2026-09-11
- Camada: Projeto
- Commit: `chore(PROJECT): organize Claude workspace settings`

## Objetivo

Versionar a alteração externa que moveu a referência de instruções do Claude para um diretório próprio.

## Motivo

A mudança já existia no workspace e precisava ser incluída no histórico do repositório antes das próximas implementações, sem ser misturada a um commit de backend ou frontend.

## Entregas

- Remoção de `CLAUDE.md` da raiz.
- Criação de `claude/CLAUDE.md` com referência a `AGENTS.md`.
- Registro da alteração no histórico de tasks.

## Arquivos

- Removido: `CLAUDE.md`.
- Criado: `claude/CLAUDE.md`.
- Atualizado: `docs/tasks/README.md`.

## Verificações

- Conferência do conteúdo antes do versionamento.
- Revisão do diff para confirmar que a mudança representa somente a reorganização solicitada.
