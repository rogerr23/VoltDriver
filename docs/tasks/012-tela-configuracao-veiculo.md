# Task 012 — Tela de configuração do veículo

## Objetivo

Criar a interface mobile-first para o motorista cadastrar e editar os parâmetros do veículo usados nos cálculos do VoltDriver.

## Motivo

O motor de cálculos depende do consumo do veículo, das tarifas de energia e das referências de gasolina. Uma tela simples e protegida permite que cada motorista forneça esses dados sem depender de valores fixos ou de alterações no banco.

## O que foi criado

- Rota protegida `/veiculo` com carregamento server-side da configuração ativa.
- Estado inicial explicativo para motoristas que ainda não configuraram um veículo.
- Formulário dividido em três blocos curtos: veículo elétrico, energia e comparação com gasolina.
- Campos com unidades visíveis, exemplos de preenchimento e teclado decimal em dispositivos móveis.
- Preenchimento automático dos dados existentes ao retornar à tela.
- Integração do formulário com a Server Action criada na Task 011.
- Mensagens acessíveis de sucesso e erro após o salvamento.
- Botão de salvar grande e destacado para uso em celular.
- Acesso à configuração do veículo a partir da Home inicial.

## Decisões

- O formulário não preenche valores de referência automaticamente, pois autonomia e custos reais variam entre motoristas.
- O estado interativo fica em um Client Component pequeno; autenticação e leitura inicial continuam no servidor.
- Os campos aceitam vírgula ou ponto, preservando a forma de apresentação adequada ao português do Brasil.
- A configuração foi organizada por assunto para reduzir a carga visual e evitar um formulário único sem contexto.
- Não foram adicionadas jornadas, recargas, metas ou cálculos visuais nesta task.

## Arquivos principais

- `src/app/veiculo/page.tsx`
- `src/modules/vehicles/ui/vehicle-form.tsx`
- `src/modules/vehicles/ui/vehicle-form-field.tsx`
- `src/app/page.tsx`

## Verificações

- Cadastro de um usuário local e acesso autenticado à rota `/veiculo`.
- Estado inicial sem veículo configurado.
- Salvamento dos valores de referência do BYD Dolphin Mini.
- Persistência dos dados confirmada após recarregar a página.
- Validação visual em viewport de celular de 390 × 844 px.
- Nenhum erro ou aviso registrado no console do navegador.
- `pnpm test` — 53 testes aprovados.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.

## Commit

`feat(FRONTEND): add vehicle configuration screen`
