# Sistema de Gestão do Grupo de Jovens - Paróquia Santa Terezinha

Sistema web para gestão completa do Grupo de Jovens, incluindo controle de presença, gestão financeira, calendário de eventos e cadastro de membros.

## 🚀 Tecnologias

- **React 18+** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Material-UI (MUI) v5** - Biblioteca de componentes React
- **React Router** - Roteamento para aplicações React
- **Date-fns** - Biblioteca para manipulação de datas
- **Vite** - Build tool e dev server
- **Firebase** - Backend as a Service (será configurado na Fase 2)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório ou navegue até o diretório do projeto:
```bash
cd gj-santa-terezinha
```

2. Instale as dependências:
```bash
npm install
```

## 🎯 Como Executar

### Modo Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173`

### Build de Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`

### Preview do Build
```bash
npm run preview
```
Visualize o build de produção localmente

### Linting
```bash
npm run lint
```
Verifica o código em busca de problemas

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Componentes de layout (Header, Sidebar, etc.)
│   └── common/         # Componentes comuns (Button, Card, etc.)
├── pages/              # Páginas da aplicação
│   ├── Dashboard/      # Dashboard principal
│   ├── Calendar/       # Calendário de eventos
│   ├── Finance/        # Controle financeiro
│   └── Members/        # Gestão de membros
├── services/           # Serviços (API, Firebase, etc.)
├── types/              # TypeScript types e interfaces
├── utils/              # Funções utilitárias
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── theme/              # Configuração do tema MUI
├── App.tsx             # Componente principal
└── main.tsx            # Entry point
```

## 🎨 Funcionalidades Planejadas

### Fase 1 - Estrutura Base ✅
- [x] Configuração inicial do projeto
- [x] Estrutura de diretórios
- [x] Tema customizado Material-UI
- [x] Roteamento básico
- [x] Layout responsivo com menu lateral

### Fase 2 - Autenticação (Próxima)
- [ ] Integração com Firebase Authentication
- [ ] Tela de login
- [ ] Controle de acesso por perfil (Admin, Coordenador, Membro)
- [ ] Proteção de rotas

### Fase 3 - Dashboard
- [ ] Estatísticas gerais
- [ ] Próximos eventos
- [ ] Resumo financeiro
- [ ] Gráficos e indicadores

### Fase 4 - Calendário
- [ ] Visualização mensal de eventos
- [ ] Criação/edição de eventos
- [ ] Marcação de encontros regulares (sábados)
- [ ] Controle de presença

### Fase 5 - Gestão Financeira
- [ ] Registro de entradas e saídas
- [ ] Controle de mensalidades
- [ ] Relatórios financeiros
- [ ] Gráficos de receitas/despesas

### Fase 6 - Gestão de Membros
- [ ] Cadastro de membros
- [ ] Histórico de presença
- [ ] Estatísticas individuais
- [ ] Exportação de dados

## 🎨 Tema e Cores

O tema foi customizado com cores inspiradas na identidade católica:

- **Primary (Azul)**: `#1976d2` - Representa a fé e espiritualidade
- **Secondary (Vermelho)**: `#dc004e` - Representa o Espírito Santo
- **Background**: `#f5f5f5` - Fundo claro e limpo

## 📝 Tipos TypeScript

O projeto utiliza TypeScript com modo estrito habilitado. Todos os tipos principais estão definidos em `src/types/index.ts`:

- `Member` - Dados de membros
- `Event` - Eventos e encontros
- `Transaction` - Transações financeiras
- `SaturdayType` - Tipo de sábado (1º, 2º, 3º, 4º)
- E outros...

## 🔐 Segurança

- TypeScript strict mode habilitado
- Validação de tipos em tempo de compilação
- Proteção de rotas (será implementado na Fase 2)
- Autenticação Firebase (será implementado na Fase 2)

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se a diferentes tamanhos de tela:
- Desktop (>= 900px) - Menu lateral fixo
- Mobile (< 900px) - Menu lateral retrátil

## 🤝 Contribuindo

Este é um projeto interno do Grupo de Jovens da Paróquia Santa Terezinha.

## 📄 Licença

Uso interno - Paróquia Santa Terezinha

## 📞 Contato

Para dúvidas ou sugestões sobre o sistema, entre em contato com a coordenação do Grupo de Jovens.

---

**Desenvolvido com ❤️ para o Grupo de Jovens da Paróquia Santa Terezinha**
