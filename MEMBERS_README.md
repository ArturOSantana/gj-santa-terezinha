# 👥 Página de Gestão de Membros

## 📋 Visão Geral

A Página de Gestão de Membros é a última funcionalidade do MVP do Sistema de Gestão do Grupo de Jovens da Paróquia Santa Terezinha. Esta página permite o gerenciamento completo dos membros do grupo, incluindo cadastro, edição, visualização de detalhes e registro de presenças.

## ✨ Funcionalidades Implementadas

### 1. **Estatísticas de Membros**
- **Total de Membros**: Exibe o número total de membros cadastrados
- **Membros Ativos**: Mostra quantos membros estão com status ativo
- **Taxa Média de Presença**: Calcula e exibe a taxa média de presença de todos os membros ativos

### 2. **Sistema de Filtros Avançado**
- **Busca por Texto**: Pesquisa por nome ou email do membro
- **Filtro por Grupo**: 
  - Todos
  - Rapazes (masculino)
  - Moças (feminino)
- **Filtro por Status**:
  - Todos
  - Ativos
  - Inativos
- **Filtro por Faixa Etária**:
  - Todas
  - 14-16 anos
  - 17-19 anos
  - 20-22 anos
- **Chips de Filtros Ativos**: Visualização clara dos filtros aplicados com opção de remover individualmente

### 3. **Listagem de Membros**
- **Cards Responsivos**: Grid adaptável (4 colunas desktop, 2 tablet, 1 mobile)
- **Informações Exibidas em Cada Card**:
  - Avatar com foto ou iniciais
  - Nome completo
  - Badge de grupo (Rapazes/Moças) com cores distintas
  - Badge de status (Ativo/Inativo/Suspenso)
  - Idade calculada automaticamente
  - Email
  - Telefone formatado
- **Ações Rápidas**:
  - Ver Detalhes
  - Editar
  - Excluir (com confirmação)
- **Paginação**: 12 membros por página com navegação completa

### 4. **Cadastro e Edição de Membros**
Modal com formulário completo incluindo:
- **Informações Básicas**:
  - Nome completo (obrigatório, mínimo 3 caracteres)
  - Email (obrigatório, validação de formato)
  - Telefone (obrigatório, formato brasileiro: (XX) XXXXX-XXXX)
  - Data de nascimento (obrigatório, idade entre 14-22 anos)
  - Gênero (obrigatório: Rapazes/Moças)
  - Status (Ativo/Inativo/Suspenso)
- **Observações**: Campo de texto livre para informações adicionais
- **Validações em Tempo Real**: Feedback visual imediato de erros
- **Formatação Automática**: Telefone formatado enquanto digita

### 5. **Visualização de Detalhes do Membro**
Modal completo com:
- **Informações Pessoais**:
  - Avatar grande
  - Nome, email, telefone
  - Data de nascimento formatada com idade
  - Data de entrada no grupo
  - Gênero
- **Estatísticas de Presença**:
  - Taxa de presença em percentual
  - Número de eventos participados vs total
  - Cards visuais coloridos
- **Histórico de Eventos**:
  - Lista dos últimos 5 eventos que o membro participou
  - Data de cada evento
  - Ícone de confirmação de presença
- **Observações**: Exibição de notas adicionais
- **Ação Rápida**: Botão para editar diretamente do modal de detalhes

### 6. **Registro de Presença**
Dialog interativo para marcar presença em eventos:
- **Seleção de Evento**: Dropdown com eventos recentes e futuros (últimos 7 dias)
- **Lista de Membros**:
  - Checkboxes para cada membro ativo
  - Avatar e informações básicas
  - Busca em tempo real
  - Filtro por gênero (Todos/Rapazes/Moças)
- **Controles em Massa**:
  - Marcar/Desmarcar Todos
  - Marcar/Desmarcar Rapazes
  - Marcar/Desmarcar Moças
- **Contador**: Exibe quantos membros estão selecionados
- **Carregamento de Presenças Existentes**: Se o evento já tem presenças registradas, elas são carregadas automaticamente

## 🎨 Design e UX

### Cores por Grupo
- **Rapazes**: Azul (#2196f3)
- **Moças**: Rosa (#e91e63)

### Cores por Status
- **Ativo**: Verde (#4caf50)
- **Inativo**: Cinza (#9e9e9e)
- **Suspenso**: Vermelho (#f44336)

### Responsividade
- **Desktop (≥1200px)**: Grid de 4 colunas
- **Tablet (768px-1199px)**: Grid de 2 colunas
- **Mobile (<768px)**: Grid de 1 coluna, modais em tela cheia

### Acessibilidade
- Labels ARIA em todos os botões e controles
- Navegação por teclado
- Feedback visual claro
- Contraste adequado de cores

## 📊 Dados Mockados

### Membros
- **24 membros** cadastrados (12 rapazes, 12 moças)
- **22 ativos**, 2 inativos
- Idades variadas entre 14-22 anos
- Dados completos incluindo email, telefone e datas

### Integração com Eventos
- Presenças registradas nos eventos passados
- Cálculo automático de taxa de presença
- Histórico de participação

## 🔧 Arquitetura Técnica

### Componentes Criados

1. **MemberCard.tsx**
   - Card individual de membro
   - Props: member, onEdit, onDelete, onViewDetails
   - Cálculo de idade e iniciais
   - Formatação de dados

2. **MemberFormModal.tsx**
   - Formulário de cadastro/edição
   - Validações completas
   - Formatação de telefone em tempo real
   - DatePicker integrado

3. **MemberDetailsModal.tsx**
   - Visualização completa de detalhes
   - Cálculo de estatísticas de presença
   - Histórico de eventos
   - Integração com dados de eventos

4. **AttendanceDialog.tsx**
   - Registro de presença em eventos
   - Filtros e busca
   - Controles em massa
   - Carregamento de presenças existentes

### Custom Hook

**useMembers.ts**
- Gerenciamento de estado dos membros
- Funções CRUD (Create, Read, Update, Delete)
- Sistema de filtros
- Cálculo de estatísticas
- Gerenciamento de presenças
- Preparado para integração com Firebase

### Página Principal

**Members.tsx**
- Integração de todos os componentes
- Layout responsivo
- Gerenciamento de modais
- Paginação
- Feedback visual

## 🚀 Como Usar

### Acessar a Página
1. Navegue até `/members` no menu lateral
2. A página carrega automaticamente os membros mockados

### Adicionar Novo Membro
1. Clique no botão "Novo Membro"
2. Preencha o formulário
3. Clique em "Adicionar Membro"

### Editar Membro
1. Clique no ícone de edição no card do membro
2. Modifique os dados desejados
3. Clique em "Salvar Alterações"

### Ver Detalhes
1. Clique no ícone de visualização no card
2. Explore as informações e estatísticas
3. Opcionalmente, clique em "Editar" para modificar

### Excluir Membro
1. Clique no ícone de exclusão no card
2. Confirme a ação no dialog

### Registrar Presença
1. Clique em "Registrar Presença"
2. Selecione o evento
3. Marque os membros presentes
4. Clique em "Salvar Presenças"

### Filtrar Membros
1. Use o campo de busca para pesquisar por nome/email
2. Selecione filtros de grupo, status ou faixa etária
3. Os resultados são atualizados automaticamente
4. Remova filtros clicando no X dos chips

## 🔮 Próximos Passos (Integrações Futuras)

### 1. Firebase Authentication
```typescript
// Cada membro terá uma conta de usuário
// Permitirá login individual dos membros
// Controle de permissões por role
```

### 2. Google Sheets Integration
```typescript
// Sincronização bidirecional com planilha
// Backup automático dos dados
// Importação/exportação facilitada
```

### 3. Sistema de Notificações
```typescript
// Lembretes de encontros via email/SMS
// Notificações de aniversários
// Avisos de eventos especiais
```

### 4. Upload de Fotos
```typescript
// Firebase Storage para fotos de perfil
// Crop e redimensionamento automático
// Fallback para avatares com iniciais
```

### 5. Relatórios Avançados
```typescript
// Relatório de presença por período
// Gráficos de participação
// Exportação em PDF
```

### 6. Gestão de Grupos Pequenos
```typescript
// Divisão em grupos menores
// Coordenadores de grupo
// Reuniões específicas por grupo
```

## 📝 Notas de Desenvolvimento

### Performance
- Uso de `useMemo` para cálculos pesados
- `React.memo` em componentes que não precisam re-renderizar
- Paginação para evitar renderização de muitos cards
- Filtros otimizados

### Manutenibilidade
- Código bem comentado
- Separação clara de responsabilidades
- Componentes reutilizáveis
- Hook customizado para lógica de negócio

### Escalabilidade
- Estrutura preparada para integração com backend
- Comentários TODO indicando pontos de integração
- Estado gerenciado de forma centralizada
- Fácil adição de novos filtros e funcionalidades

## ✅ Status do MVP

### Páginas Completas
- ✅ Dashboard
- ✅ Calendário
- ✅ Finanças
- ✅ **Membros** (NOVA!)

### Funcionalidades Core
- ✅ Gestão de eventos
- ✅ Controle financeiro
- ✅ Gestão de membros
- ✅ Registro de presenças
- ✅ Estatísticas e relatórios básicos

### Próximas Etapas
1. Testes de integração
2. Deploy em produção
3. Treinamento dos usuários
4. Coleta de feedback
5. Implementação de integrações (Firebase, Google Sheets)

---

**Desenvolvido com ❤️ para o Grupo de Jovens da Paróquia Santa Terezinha**

*Made with Bob*