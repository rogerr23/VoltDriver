# Task 007 — Clientes Supabase

- Status: concluída
- Data: 2026-09-11
- Camada: API
- Commit: `feat(API): configure Supabase clients`

## Objetivo

Preparar o acesso ao Supabase em código executado no navegador e no servidor.

## Motivo

O Next.js executa código em contextos diferentes. Clientes separados evitam uso incorreto de cookies, centralizam a configuração e preparam autenticação e persistência sem expor chaves privadas.

## Entregas

- Dependências oficiais `@supabase/supabase-js` e `@supabase/ssr`.
- Validação central das variáveis públicas do Supabase.
- Cliente singleton para o navegador.
- Cliente por requisição para Server Components, Server Actions e Route Handlers.
- Leitura e escrita compatível com a API assíncrona de cookies do Next.js 16.
- Testes da configuração pública.
- Documentação das variáveis no README.

## Arquivos principais

- Criado: `src/lib/supabase/env.ts`.
- Criado: `src/lib/supabase/env.test.ts`.
- Criado: `src/lib/supabase/client.ts`.
- Criado: `src/lib/supabase/server.ts`.
- Atualizados: `.env.example`, `package.json`, `pnpm-lock.yaml` e `README.md`.
- Atualizado: `docs/tasks/README.md`.

## Decisões técnicas

- Uso da chave publicável atual do Supabase em vez do nome legado “anon key”.
- Nenhuma service role key é usada ou exposta nesta camada.
- O cliente de navegador é reutilizado; o cliente de servidor é criado por requisição.
- A renovação automática da sessão por Proxy ficará para a task de autenticação.
- O schema e os tipos do banco serão adicionados na próxima task de persistência.

## Verificações

- Configuração válida e normalização de espaços.
- Ausência de URL ou chave.
- URL inválida ou protocolo não permitido.
- `pnpm test`.
- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm build` sem credenciais locais, confirmando que a configuração é carregada sob demanda.
