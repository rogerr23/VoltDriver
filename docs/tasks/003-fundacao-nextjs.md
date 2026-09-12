# Task 003 — Fundação Next.js

- Status: concluída
- Data: 2026-09-11
- Camada: Projeto
- Commit: `b2919ec chore(PROJECT): initialize Next.js application`

## Objetivo

Criar a base executável do VoltDriver sem antecipar funcionalidades do produto.

## Motivo

As regras, integrações e telas precisam de uma fundação padronizada, tipada e verificável. Esta task estabeleceu o ambiente comum para todas as próximas entregas.

## Entregas

- Next.js 16 com App Router.
- React 19.
- TypeScript em modo estrito.
- Tailwind CSS 4.
- ESLint.
- Gerenciamento de dependências com pnpm e lockfile.
- Alias de importação `@/*` para `src/*`.
- Variáveis de ambiente de exemplo para o Supabase.
- Metadados e idioma `pt-BR`.
- Página inicial mínima do VoltDriver.
- Comandos de desenvolvimento e verificação no README.

## Arquivos principais

- Configuração: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs` e `postcss.config.mjs`.
- Ambiente: `.env.example` e `.gitignore`.
- Aplicação: `src/app/layout.tsx`, `src/app/page.tsx` e `src/app/globals.css`.
- Orientação do framework: `AGENTS.md` e `CLAUDE.md`.
- Atualizado: `README.md`.

## Decisões técnicas

- O build usa Webpack explicitamente porque o Turbopack tentou abrir uma porta interna bloqueada no ambiente de execução.
- A página inicial permaneceu propositalmente simples.
- Assets genéricos do template Next.js foram removidos para evitar identidade visual incorreta.

## Verificações

- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm build`.
- Servidor local iniciado com resposta HTTP 200.
- Inspeção visual em 320 px.
- Confirmação de `scrollWidth` igual a `innerWidth`, sem overflow horizontal.
