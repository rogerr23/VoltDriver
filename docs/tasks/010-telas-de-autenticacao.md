# Task 010 — Telas de autenticação

## Objetivo

Criar as telas mobile-first de entrada e cadastro e conectá-las à autenticação server-side implementada na task anterior.

## Motivo

O motorista precisa concluir o primeiro fluxo utilizável do produto antes de acessar configurações, jornadas e recargas. A interface deve permitir autenticação rápida, legível e confortável em celular.

## O que foi criado

- Página de entrada em `/entrar`.
- Página de cadastro em `/cadastro`.
- Estrutura visual compartilhada com identidade VoltDriver e contexto do produto.
- Formulários conectados às Server Actions de login e cadastro.
- Campos com autocomplete, teclado de e-mail, limites e validação nativa.
- Exibição acessível dos erros retornados pelo servidor.
- Estados de envio que desabilitam o botão e informam a ação em andamento.
- Mensagem para confirmação de conta por e-mail.
- Estado visual para links de confirmação inválidos ou expirados.
- Navegação entre entrada e cadastro e atalhos na Home provisória.
- Ajustes globais de cores e seleção de texto para a identidade visual inicial.

## Decisões visuais

- Fundo escuro para reduzir brilho dentro do carro ou entre jornadas.
- Verde-lima reservado para ações primárias, foco e identidade elétrica.
- Controles com 56 px de altura e cantos amplos para facilitar o toque.
- Uma coluna no celular e painel contextual adicional somente em desktop.
- Formulários limitados ao essencial, sem login social ou recuperação de senha nesta etapa.

## Arquivos principais

- `src/app/entrar/page.tsx`
- `src/app/cadastro/page.tsx`
- `src/modules/auth/ui/auth-shell.tsx`
- `src/modules/auth/ui/sign-in-form.tsx`
- `src/modules/auth/ui/sign-up-form.tsx`
- `src/modules/auth/ui/auth-field.tsx`
- `src/modules/auth/ui/auth-submit-button.tsx`
- `src/modules/auth/ui/brand-mark.tsx`

## Verificações

- `pnpm test` — 44 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build` — páginas `/entrar` e `/cadastro` geradas corretamente.
- Servidor local executado sem erros.
- Inspeção visual mobile das telas de entrada, cadastro e confirmação inválida.
- Verificação de hierarquia, contraste, áreas de toque e ausência de rolagem horizontal.

## Commit

`feat(FRONTEND): add mobile authentication screens`
