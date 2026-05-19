# Sistema de Gestão - Grupo de Jovens Santa Terezinha

Sistema web para gerenciamento do Grupo de Jovens da Paróquia Santa Terezinha.

## Funcionalidades

- Dashboard com visão geral
- Calendário de eventos
- Controle financeiro (receitas e despesas)
- Gestão de membros
- Sistema de autenticação com 3 níveis de acesso:
  - Admin: acesso total
  - Coordenador: gerencia eventos, finanças e membros
  - Membro: visualiza dashboard e calendário

## Tecnologias

- React 19 + TypeScript
- Vite
- Material-UI (Fluent UI v9)
- Firebase (Authentication + Firestore)
- Vercel (deploy)

## Configuração Local

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (crie arquivo `.env`):
```
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push na branch principal

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contextos React (Auth)
├── hooks/          # Custom hooks
├── pages/          # Páginas da aplicação
├── services/       # Serviços (Firebase)
├── theme/          # Configuração de tema
├── types/          # Tipos TypeScript
└── utils/          # Utilitários
```

## Credenciais Iniciais

Primeiro usuário criado automaticamente como admin.

## Licença

Uso interno - Grupo de Jovens Santa Terezinha
