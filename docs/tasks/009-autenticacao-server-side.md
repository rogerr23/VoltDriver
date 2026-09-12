# Task 009 — Autenticação server-side

## Objetivo

Preparar a autenticação por e-mail e senha, o gerenciamento de sessão em cookies e a proteção reutilizável das futuras áreas privadas do VoltDriver.

## Motivo

As políticas de Row Level Security dependem da identidade autenticada. Antes dos fluxos de veículo, jornada e recarga, o servidor precisa validar o motorista e manter sua sessão atualizada com segurança.

## O que foi criado

- Validação server-side dos dados de entrada e cadastro.
- Normalização de e-mail e regras de nome e senha.
- Server Actions para login e criação de conta.
- Estado específico para contas que ainda precisam confirmar o e-mail.
- Callback PKCE para concluir confirmações do Supabase Auth.
- Logout da sessão atual por rota `POST`.
- Proxy do Next.js 16 para renovar tokens e propagar cookies e cabeçalhos contra cache indevido.
- Helper `requireAuthenticatedUser()` para proteger páginas, Server Actions e Route Handlers.
- Validação de redirecionamentos internos para impedir redirecionamento aberto.
- Testes unitários dos formulários e destinos de autenticação.

## Decisões

- A identidade é validada com `getClaims()`; cookies não são tratados isoladamente como prova de autenticação.
- O logout usa escopo local, mantendo abertas eventuais sessões do motorista em outros dispositivos.
- Mensagens de falha de login são genéricas para não revelar se uma conta existe.
- A Home atual ainda não foi bloqueada, pois a tela de entrada será criada em uma task exclusiva de frontend.
- Nenhuma interface visual foi incluída neste commit de backend.

## Arquivos principais

- `src/modules/auth/domain/forms.ts`
- `src/modules/auth/domain/forms.test.ts`
- `src/modules/auth/server/actions.ts`
- `src/modules/auth/server/session.ts`
- `src/lib/supabase/proxy.ts`
- `src/proxy.ts`
- `src/app/auth/callback/route.ts`
- `src/app/auth/signout/route.ts`

## Verificações

- `pnpm test` — 44 testes aprovados.
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build` — Proxy e rotas dinâmicas de callback/logout reconhecidos pelo Next.js.

## Commit

`feat(API): add server-side authentication foundation`
