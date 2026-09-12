# VoltDriver — referência funcional do MVP

Status: referência funcional do MVP, com implementação em andamento

Nome público do produto: **VoltDriver**.

Fonte de referência: `EV_DRIVER_OS_preenchida.xlsx`. O nome “EV Driver OS” pertence apenas ao material histórico de referência. A planilha não faz parte do produto e não deve ser importada, distribuída ou usada como banco de dados. Seus valores servem somente para entender regras e validar cálculos.

## 1. Interpretação do produto

O VoltDriver é um sistema web mobile-first para motoristas de aplicativo que usam veículo elétrico. O produto transforma poucos dados de uma jornada de trabalho e das recargas em respostas práticas:

- quanto o motorista faturou;
- qual foi seu custo estimado de energia;
- qual foi seu lucro operacional estimado;
- quanto produziu por quilômetro e por hora;
- quanto economizou em relação a um veículo a gasolina;
- qual é seu avanço em relação às metas do mês;
- como o preço das recargas altera seu custo por quilômetro.

A unidade principal do domínio é a **jornada de trabalho**. Uma jornada representa uma sessão ou bloco de trabalho, não uma corrida individual. Exemplo: trabalho das 08h às 13h, 153 km rodados e R$ 312 recebidos.

### Princípios do MVP

- Registro rápido, com poucos campos e retorno imediato.
- Métricas principais visíveis sem navegação complexa.
- Valores monetários, quilômetros e lucro têm maior hierarquia visual.
- Cálculos determinísticos e auditáveis, sem IA generativa.
- Um motorista e um veículo ativo por vez na experiência inicial.
- Dados separados por usuário com políticas de acesso no Supabase.
- Valores históricos não devem mudar silenciosamente quando as configurações atuais forem alteradas.

## 2. Escopo inicial

### Incluído

- Home com resumo de hoje e do mês.
- Cadastro e confirmação de jornada.
- Registro e resumo de recargas.
- Configuração e acompanhamento de metas mensais.
- Configuração do veículo e das tarifas de referência.
- Textos de insight produzidos por regras.
- Autenticação simples e isolamento dos dados por motorista.

### Fora do escopo

- Corridas individuais.
- Integrações com Uber, 99, InDrive ou bancos.
- IA generativa.
- Frotas, múltiplos condutores e gestão empresarial.
- Aplicativo nativo.
- Gamificação.
- Manutenção, relatórios avançados e score geral da planilha.
- Importação da planilha para o produto.

## 3. Informações essenciais para o motorista

### Prioridade máxima na Home

1. Receita de hoje.
2. Lucro operacional estimado de hoje.
3. Quilômetros rodados hoje.
4. Receita por km hoje.
5. Lucro por hora hoje.
6. Economia estimada contra gasolina hoje.
7. Progresso da meta mensal de receita.

### Contexto mensal

- Receita, lucro estimado, km, horas e economia acumulados no mês.
- Valor e percentual faltantes para a meta.
- Receita média diária necessária até o fim do mês.
- Variação do lucro por hora contra um período comparável anterior.

O MVP não precisa de um Dashboard separado. A aba Dashboard da planilha repete boa parte da Home e pode ser consolidada nela.

## 4. Entidades do domínio

### Perfil (`profiles`)

- `id`: UUID vinculado a `auth.users`.
- `display_name`: opcional.
- `timezone`: padrão `America/Sao_Paulo`.
- `created_at`, `updated_at`.

### Veículo (`vehicles`)

- `id`, `user_id`.
- `name_model`.
- `range_km`.
- `consumption_kwh_per_100km`.
- `residential_rate_per_kwh`.
- `public_rate_per_kwh`.
- `reference_gasoline_price_per_liter`.
- `reference_fuel_efficiency_km_per_liter`.
- `is_active`.
- `created_at`, `updated_at`.

### Jornada (`work_sessions`)

- `id`, `user_id`, `vehicle_id`.
- `work_date`.
- `platform`: Uber, 99, InDrive ou Outros no MVP.
- `distance_km`.
- `online_minutes`: armazenar minutos inteiros; converter para horas nos cálculos.
- `gross_earnings`.
- `tips`: padrão zero.
- `vehicle_consumption_snapshot`.
- `energy_rate_snapshot`.
- `gasoline_price_snapshot`.
- `reference_fuel_efficiency_snapshot`.
- `created_at`, `updated_at`.

Os snapshots preservam a explicação histórica dos resultados quando o motorista altera tarifas ou veículo. Receita total e demais métricas são derivadas, não digitadas.

### Recarga (`charging_sessions`)

- `id`, `user_id`, `vehicle_id`.
- `charged_at`.
- `location_name`.
- `charge_type`: residencial AC, pública AC, pública DC ou outro.
- `energy_kwh`.
- `total_cost`.
- `residential_rate_snapshot`.
- `vehicle_consumption_snapshot`.
- `created_at`, `updated_at`.

### Meta mensal (`monthly_goals`)

- `id`, `user_id`.
- `month`: primeiro dia do mês de referência.
- `revenue_target`.
- `distance_target_km`.
- `savings_target`.
- `created_at`, `updated_at`.
- Restrição única por `user_id + month`.

## 5. Modelo técnico recomendado

- PostgreSQL/Supabase armazena entradas e snapshots em tipos numéricos, nunca textos formatados.
- Dinheiro: `numeric(12,2)`.
- Distância: `numeric(10,2)`.
- Energia: `numeric(10,3)`.
- Tarifas e consumos: `numeric(10,4)`.
- Tempo: minutos inteiros positivos.
- Datas de negócio: tipo `date`; auditoria: `timestamptz`.
- Chaves estrangeiras e índices por usuário/data.
- Row Level Security em todas as tabelas do usuário.
- Fórmulas centralizadas em funções TypeScript puras e testadas. A interface não deve duplicar regras.
- Agregações de hoje e do mês podem começar em consultas simples; views/materializações não são necessárias no MVP.

## 6. Regras de negócio canônicas propostas

Nas fórmulas abaixo:

- `km` = distância da jornada;
- `horas` = `online_minutes / 60`;
- `consumo_100` = consumo configurado em kWh/100 km;
- `tarifa` = tarifa de energia aplicada à jornada;
- `receita` = ganho bruto + gorjeta;
- `km_l` = consumo do veículo a combustão de referência;
- `gasolina` = preço de referência por litro.

### Jornada

```text
receita_total = ganho_bruto + gorjeta
kwh_estimados = km × consumo_100 / 100
custo_energia_estimado = kwh_estimados × tarifa
receita_por_km = receita_total / km
receita_por_hora = receita_total / horas
lucro_estimado = receita_total - custo_energia_estimado
lucro_por_km = lucro_estimado / km
lucro_por_hora = lucro_estimado / horas
custo_gasolina_equivalente = (km / km_l) × gasolina
economia_estimada = custo_gasolina_equivalente - custo_energia_estimado
eficiencia_km_kwh = km / kwh_estimados
```

Divisões por zero não produzem uma métrica. A interface deve mostrar `—` e orientar a correção, em vez de exibir zero como resultado plausível.

### Tarifa aplicada à jornada

A jornada não pede onde a energia foi carregada. Para manter o formulário curto, a regra recomendada é:

1. usar o custo médio ponderado das recargas registradas até a data da jornada: `soma(custo) / soma(kWh)`;
2. se ainda não houver recargas, usar a tarifa residencial configurada;
3. gravar a tarifa escolhida como snapshot na jornada.

Essa regra se aproxima da planilha e impede que uma nova recarga altere retroativamente jornadas já calculadas.

A média ponderada considera somente recargas do veículo ativo com data menor ou igual à data da jornada. A tarifa resultante é limitada às quatro casas decimais suportadas pelo snapshot antes do cálculo, mantendo a confirmação exibida coerente com o histórico persistido.

### Recarga

```text
custo_por_kwh = custo_total / kwh_carregados
eficiencia_configurada = 100 / consumo_100
km_estimados_com_a_recarga = kwh_carregados × eficiencia_configurada
custo_estimado_por_km = custo_total / km_estimados_com_a_recarga
custo_equivalente_em_casa = kwh_carregados × tarifa_residencial
economia_potencial_em_casa = max(custo_total - custo_equivalente_em_casa, 0)
```

O custo por km é uma estimativa baseada no consumo configurado. O formulário solicitado não contém odômetro ou km efetivamente percorridos entre recargas.

### Metas

```text
percentual = realizado / meta × 100
falta = max(meta - realizado, 0)
excedente = max(realizado - meta, 0)
media_diaria_necessaria = falta / dias_calendario_restantes_incluindo_hoje
```

- O percentual real pode ultrapassar 100%; somente a barra visual é limitada a 100%.
- Se a meta for zero ou ausente, não calcular percentual.
- Se a meta já foi atingida, a média diária necessária é zero.
- Se o mês terminou sem atingir a meta, mostrar que o período foi encerrado, sem dividir por zero.
- O MVP considera dias corridos. Dias de trabalho planejados exigiriam uma configuração adicional e ficam para depois.

### Agregação por período

- “Hoje” usa a data local do perfil, não o horário UTC bruto.
- “Mês” usa o mês civil na mesma timezone.
- Métricas médias são calculadas pelos totais do período, não pela média simples das jornadas.
- Comparação com o período anterior deve usar mês atual até hoje contra o mesmo intervalo de dias do mês anterior. Isso evita comparar um mês parcial com um mês completo.

## 7. Insights determinísticos

Os textos devem ser curtos, baseados em estados verificáveis e nunca simular IA. Exemplos:

- `Você já atingiu 62% da sua meta mensal.`
- `Faltam R$ 1.900,00 para atingir sua meta.`
- `Você precisa faturar em média R$ X por dia até o fim do mês.`
- `Seu lucro por hora aumentou X% em relação ao mesmo período do mês anterior.`
- `Esta recarga custou R$ 1,20/kWh. Em casa, a mesma energia custaria R$ X.`

Estados sem dados precisam de mensagens próprias. Exemplo: `Registre sua primeira jornada para acompanhar o resultado de hoje.`

## 8. Estrutura inicial das páginas

### Home (`/`)

- Cabeçalho simples com período atual.
- CTA principal e persistente: `+ Registrar Jornada`.
- Cards de hoje: receita, lucro estimado, km, R$/km, R$/hora e economia.
- Card de meta mensal com barra, percentual, falta e média diária necessária.
- Dois ou três insights prioritários.
- Resumo mensal compacto.

### Registrar jornada (`/jornadas/nova`)

- Campos: data, aplicativo, km, tempo online, ganho bruto e gorjeta opcional.
- O tempo online é apresentado em horas e minutos e convertido para minutos totais antes da persistência.
- Botão grande de salvar.
- Confirmação imediata com receita, R$/km, R$/hora, kWh estimados, custo de energia, lucro e economia.
- Edição/exclusão pode entrar na mesma área quando o histórico mínimo for adicionado.

### Recargas (`/recargas` e `/recargas/nova`)

- Resumo mensal de kWh, custo total e custo médio/kWh.
- Lista curta de recargas recentes.
- Formulário com data, local, tipo, kWh e custo total.
- Confirmação com custo/kWh, custo estimado/km e comparação residencial.

### Meta mensal (`/metas`)

- Edição das três metas do mês.
- Progresso individual de receita, km e economia.
- Falta/excedente e média diária para receita.

### Veículo (`/veiculo`)

- Modelo, autonomia, consumo, tarifas residencial/pública, gasolina e eficiência do carro de referência.
- Explicação curta de onde cada valor é usado.

### Navegação

- Barra inferior mobile com Home, Recargas, Metas e Veículo.
- A ação de nova jornada deve ser a mais visível.
- No desktop, limitar a largura do conteúdo e manter a mesma hierarquia, sem criar um dashboard denso.

## 9. Validação com julho de 2026

Valores encontrados na planilha:

| Métrica | Cálculo reconciliado | Resultado |
|---|---:|---:|
| Receita | soma de 6 jornadas | R$ 1.462,40 |
| Km | soma das jornadas | 752,30 km |
| Horas | soma das jornadas | 43,40 h |
| Consumo estimado | `752,3 × 13,5 / 100` | 101,56 kWh |
| Energia carregada | soma de 5 recargas | 133,50 kWh, exibidos como 134 kWh |
| Custo real das recargas | soma do mês | R$ 120,27 |
| Custo equivalente a gasolina | `752,3 / 12 × 5,89` | R$ 369,25 |
| Economia da planilha | `369,25 - 120,27` | R$ 248,98 |
| Receita por km | `1.462,40 / 752,3` | R$ 1,94/km |
| Eficiência | `752,3 / 101,56` | 7,41 km/kWh |
| Lucro antes de manutenção | `1.462,40 - 120,27` | R$ 1.342,13 |
| Manutenção no mês | valor registrado | R$ 320,00 |
| Lucro líquido da planilha | `1.462,40 - 120,27 - 320,00` | R$ 1.022,13 |
| Lucro por hora da planilha | `1.022,13 / 43,4` | R$ 23,55/h |

Os números fornecidos no escopo são coerentes com a planilha quando se distingue energia consumida de energia carregada e se inclui manutenção no lucro líquido.

## 10. Inconsistências e decisões necessárias

### 10.1 Energia consumida versus carregada

A referência chama `134 kWh` de “Energia”, mas a eficiência de `7,4 km/kWh` usa aproximadamente `101,56 kWh` consumidos pelas jornadas. São grandezas diferentes e devem aparecer com nomes explícitos.

Decisão recomendada: jornada mostra **consumo estimado**; Recargas mostra **energia carregada**.

### 10.2 Definição de lucro

O lucro líquido de julho inclui R$ 320 de manutenção. Manutenção não está no escopo solicitado. Além disso, a planilha calcula o lucro de cada jornada usando energia estimada, mas o total mensal usa recargas reais e manutenção.

Decisão recomendada para o MVP: chamar o indicador de **lucro operacional estimado** e defini-lo como receita menos energia estimada atribuída às jornadas. Não chamá-lo de lucro líquido. O gasto real com recargas permanece visível separadamente. Quando manutenção e outros custos entrarem no produto, poderá existir um lucro líquido ampliado.

Consequência: o MVP valida as fórmulas-base de julho, mas não deve prometer reproduzir R$ 1.022,13 enquanto manutenção estiver fora do domínio.

### 10.3 Economia diária da planilha

A planilha subtrai recargas feitas no mesmo dia. Em 27/07, ela mostra aproximadamente R$ 75 de economia porque não houve recarga naquela data, embora a jornada tenha consumido energia.

Decisão recomendada: economia de uma jornada/dia usa seu custo de energia estimado, independentemente da data em que ocorreu a recarga.

### 10.4 Custo por km da recarga

A planilha deriva km entre leituras de odômetro. O formulário solicitado não pede odômetro.

Decisão recomendada: calcular custo por km com o consumo configurado do veículo e rotular o resultado como estimado.

### 10.5 Um ou vários aplicativos por jornada

O escopo pede “aplicativo utilizado” no singular, mas motoristas podem operar vários apps na mesma sessão.

Decisão inicial: permitir uma opção `Outros/Múltiplos` sem modelar divisão de receita por aplicativo. O detalhamento pode evoluir após validação com usuários.

### 10.6 Período anterior

“Lucro por hora aumentou em relação ao período anterior” não define a janela.

Decisão recomendada: comparar o mês atual até hoje com os mesmos dias do mês anterior.

### 10.7 Problemas técnicos observados na planilha

- A primeira jornada possui fórmulas ausentes para receita total e custo de recarga.
- Algumas células importadas exibem `#NAME?`, embora as fórmulas originais apontem para configurações e nomes definidos.
- A planilha usa “corridas” para contar registros que, pelo domínio correto, são jornadas.
- O cartão “Eficiência” do Dashboard exibe lucro por km, enquanto “eficiência energética” aparece em outro local.
- A aba Relatórios depende de `TODAY()`, o que torna o histórico sensível ao ano corrente e aos valores em cache.
- Datas de recarga e jornadas não representam necessariamente o mesmo consumo energético, portanto somas por data não devem ser usadas para atribuir custo diário.

Esses pontos são referências de validação; não devem ser copiados para a implementação.

## 11. Plano de implementação em tasks pequenas

Nenhuma task abaixo foi executada nesta etapa.

### Task 1 — Fundação do projeto

- Criar Next.js com TypeScript, Tailwind e lint.
- Definir tokens visuais básicos e estrutura mobile-first.
- Configurar variáveis de ambiente e clientes Supabase.
- Critério: projeto inicia, lint e typecheck passam, e existe um shell mobile vazio.

### Task 2 — Motor de cálculos

- Implementar funções puras para jornada, recarga, metas e agregações.
- Definir arredondamento apenas na apresentação; manter precisão nos cálculos.
- Criar testes unitários com os dados de julho e casos de zero/ausência.
- Critério: reconciliações documentadas passam e divisões inválidas retornam ausência controlada.

### Task 3 — Banco e segurança

- Criar migrations para `profiles`, `vehicles`, `work_sessions`, `charging_sessions` e `monthly_goals`.
- Adicionar constraints, índices, timestamps e RLS.
- Criar tipos TypeScript a partir do schema.
- Critério: um usuário não consegue consultar ou alterar dados de outro.

### Task 4 — Configuração do veículo

- Criar tela e persistência dos parâmetros obrigatórios.
- Validar valores positivos e campos monetários.
- Criar estado inicial orientando o cadastro quando não houver veículo.
- Critério: configurações salvas alimentam o motor de cálculo.

### Task 5 — Registrar jornada

- Criar formulário curto e otimizado para toque.
- Calcular e salvar snapshots.
- Exibir confirmação imediata com as métricas solicitadas.
- Critério: a jornada de 27/07 retorna receita de R$ 312,10, R$ 2,04/km e consumo estimado próximo de 20,63 kWh.

### Task 6 — Recargas

- Criar lista/resumo e formulário de nova recarga.
- Calcular custo/kWh, custo estimado/km e comparação residencial.
- Critério: tarifas residencial e pública produzem R$ 0,0878/km e R$ 0,1620/km com consumo de 13,5 kWh/100 km.

### Task 7 — Metas mensais

- Criar edição e upsert por mês.
- Implementar progresso, falta, excedente e média diária necessária.
- Critério: metas ausentes, atingidas, superadas e mês encerrado têm estados corretos.

### Task 8 — Home e insights

- Agregar hoje, mês e período anterior comparável.
- Criar cards, CTA principal, progresso e textos determinísticos.
- Implementar estados vazios e de configuração incompleta.
- Critério: nenhuma métrica diária depende de ter ocorrido recarga no mesmo dia.

### Task 9 — Verificação do MVP

- Rodar lint, typecheck e testes.
- Testar fluxo principal de cadastro, jornada, recarga e meta.
- Validar layout em larguras de 320, 375, 390 e 430 px, além de desktop.
- Verificar acessibilidade básica, alvos de toque, contraste, teclado e mensagens de erro.
- Critério: fluxo principal funciona sem overflow horizontal e sem erro de console.

## 12. Ordem recomendada de entrega

1. Tasks 1 e 2: base técnica e regras testadas.
2. Tasks 3 e 4: persistência segura e parâmetros do veículo.
3. Task 5: primeiro fluxo de valor completo.
4. Tasks 6 e 7: custos e metas.
5. Tasks 8 e 9: visão consolidada e validação final.

Cada task deve terminar executável e testada. Funcionalidades fora do escopo só entram após feedback de motoristas reais.

## 13. Convenção de commits

Cada task concluída deve terminar com seus arquivos versionados em commit. Antes do commit, executar as verificações proporcionais à mudança e revisar o diff para evitar arquivos não relacionados.

### Separação obrigatória

- Backend, banco, Supabase, rotas de API e regras executadas no servidor: `feat(API): descrição curta`.
- Componentes, páginas, estilos e comportamento da interface: `feat(FRONTEND): descrição curta`.
- Se uma task alterar backend e frontend, criar dois commits separados e incluir em cada um somente os arquivos da respectiva camada.
- Não misturar alterações não relacionadas no mesmo commit.

### Outros tipos

- Documentação: `docs(PROJECT): descrição curta`.
- Testes sem nova funcionalidade: `test(API): ...` ou `test(FRONTEND): ...`.
- Correções: `fix(API): ...` ou `fix(FRONTEND): ...`.
- Configuração e manutenção: `chore(PROJECT): ...`.

Os scopes devem permanecer em maiúsculas conforme definido acima. Commits de integração que incluam contratos compartilhados devem ser separados pela responsabilidade predominante ou, quando isso não for possível sem quebrar a entrega, usar `chore(PROJECT)` com justificativa no resumo da task.

### Histórico das tasks

Cada task concluída deve criar ou atualizar seu registro em `docs/tasks/`. O documento precisa informar objetivo, motivo, entregas, arquivos relevantes, decisões e verificações executadas. O índice `docs/tasks/README.md` deve ser atualizado no mesmo commit da task.
