# 🏛️ GJ Santa Terezinha - Sistema de Gestão

Sistema completo de gestão para Grupo de Jovens, desenvolvido com React + TypeScript + Firebase.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral de membros, eventos e finanças
- Estatísticas em tempo real
- Gráficos e indicadores

### 👥 Gestão de Membros
- Cadastro completo de membros
- Sistema de permissões (Admin, Coordenador, Membro)
- Controle de consentimento para comunicações

### 📅 Calendário
- Integração com Google Calendar
- Criação e edição de eventos
- Sincronização automática
- Cache inteligente (30 minutos)

### 💰 Finanças
- Controle de receitas e despesas
- Relatórios financeiros
- Histórico de transações

### 📢 Boa Nova - Sistema de Comunicação
- **E-mail**: Envio em massa com Nodemailer
- **WhatsApp**: Integração com Baileys
- Sistema anti-banimento
- Upload de imagens
- Histórico de envios

## 🛠️ Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Material-UI (MUI)** - Componentes
- **Firebase SDK** - Auth, Firestore, Storage, Functions

### Backend
- **Firebase Functions** (Node.js 20)
- **Firestore** - Banco de dados
- **Firebase Auth** - Autenticação
- **Firebase Storage** - Armazenamento de arquivos
- **Nodemailer** - Envio de e-mails
- **Baileys** - WhatsApp Web API
- **Google Calendar API** - Integração de calendário

### CI/CD
- **GitHub Actions** - Deploy automático
- **Firebase Hosting** - Hospedagem

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Firebase CLI
- Conta Firebase (Blaze Plan)

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd gj-santa-terezinha
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase
```bash
# Faça login no Firebase
firebase login

# Inicialize o projeto (se necessário)
firebase init
```

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo:
```bash
cp src/config/.env.example src/config/.env
```

Edite `src/config/.env` com suas credenciais do Firebase.

### 5. Configure o Gmail (para envio de e-mails)
```bash
firebase functions:config:set gmail.user="seu-email@gmail.com"
firebase functions:config:set gmail.password="sua-senha-app"
```

### 6. Configure o Google Calendar API

Siga o guia em `CONFIGURACAO_LOCAL.md` para configurar a API do Google Calendar.

## 🚀 Desenvolvimento

### Executar localmente
```bash
# Frontend
npm run dev

# Emuladores Firebase (em outro terminal)
firebase emulators:start
```

### Build para produção
```bash
npm run build
```

### Deploy manual
```bash
# Deploy completo (Functions + Hosting)
firebase deploy

# Deploy apenas Hosting
firebase deploy --only hosting

# Deploy apenas Functions
firebase deploy --only functions
```

## 🤖 CI/CD - Deploy Automático

O projeto está configurado com GitHub Actions para deploy automático.

### Configuração

1. Gere a service account do Firebase:
```bash
firebase init hosting:github
```

2. O workflow será executado automaticamente em cada push para `main` ou `master`

3. Veja o guia completo em `CONFIGURACAO_CI_CD.md`

### Fluxo de Deploy
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

O GitHub Actions irá:
1. ✅ Instalar dependências
2. ✅ Fazer build do projeto
3. ✅ Deploy para Firebase Hosting
4. ✅ Site online em ~2-3 minutos

## 📁 Estrutura do Projeto

```
gj-santa-terezinha/
├── .github/
│   └── workflows/
│       └── firebase-hosting.yml    # CI/CD workflow
├── functions/                       # Firebase Functions
│   ├── src/
│   │   ├── boanova/                # Sistema Boa Nova
│   │   │   ├── email.service.ts
│   │   │   └── whatsapp.service.ts
│   │   ├── googleCalendar.ts       # Google Calendar API
│   │   └── index.ts
│   └── package.json
├── src/
│   ├── components/                 # Componentes React
│   │   ├── auth/                   # Autenticação
│   │   ├── common/                 # Componentes comuns
│   │   └── layout/                 # Layout
│   ├── contexts/                   # Contexts (Auth, etc)
│   ├── hooks/                      # Custom hooks
│   ├── pages/                      # Páginas
│   │   ├── BoaNova/               # Sistema de comunicação
│   │   ├── Calendar/              # Calendário
│   │   ├── Dashboard/             # Dashboard
│   │   ├── Finance/               # Finanças
│   │   ├── Members/               # Membros
│   │   └── Users/                 # Usuários
│   ├── services/                   # Serviços
│   │   ├── auth.service.ts
│   │   ├── boanova.service.ts
│   │   ├── firestore.service.ts
│   │   └── googleCalendar.service.ts
│   ├── theme/                      # Tema MUI
│   ├── types/                      # TypeScript types
│   └── utils/                      # Utilitários
├── CONFIGURACAO_CI_CD.md          # Guia CI/CD
├── CONFIGURACAO_LOCAL.md          # Guia configuração local
├── firebase.json                   # Config Firebase
├── firestore.rules                 # Regras Firestore
└── package.json
```

## 🔐 Segurança

### Firestore Rules
- Membros só podem ler seus próprios dados
- Apenas admins e coordenadores podem criar/editar
- Validação de dados no backend

### Firebase Functions
- Validação de autenticação em todas as functions
- Verificação de permissões (role-based)
- Rate limiting para WhatsApp

### Consentimento
- Sistema de opt-in para e-mail e WhatsApp
- Dados armazenados com timestamp
- Possibilidade de revogar consentimento

## 📊 Firebase Functions

### Boa Nova (6 functions)
1. `sendEmailBroadcast` - Envio de e-mails em massa
2. `verifyEmail` - Verificar configuração de e-mail
3. `startWhatsAppSession` - Iniciar sessão WhatsApp (QR Code)
4. `checkWhatsAppSession` - Verificar status da sessão
5. `endWhatsAppSession` - Encerrar sessão
6. `sendWhatsAppBroadcast` - Envio de mensagens WhatsApp

### Google Calendar (4 functions)
1. `getCalendarEvents` - Buscar eventos
2. `createCalendarEvent` - Criar evento
3. `updateCalendarEvent` - Atualizar evento
4. `deleteCalendarEvent` - Deletar evento

### Scheduled (2 functions)
1. `cleanupOldBroadcasts` - Limpar broadcasts antigos (diário)
2. `cleanupExpiredWhatsAppSessions` - Limpar sessões expiradas (1h)

**Total**: 12 Firebase Functions

## 🌐 URLs

- **Produção**: https://gj-santaterezinha.web.app
- **Console Firebase**: https://console.firebase.google.com/project/gj-santaterezinha

## 📈 Performance

### Frontend
- Build: ~1.5 MB (449 KB gzipped)
- Tempo de build: ~500ms
- Cache inteligente para Google Calendar (30 min)

### Backend
- Cold start WhatsApp: ~2-3 minutos
- Timeout WhatsApp: 9 minutos (máximo)
- Timeout padrão: 60 segundos

## 🐛 Troubleshooting

### Erro: "deadline-exceeded" no WhatsApp
**Solução**: Já corrigido! Timeout aumentado para 9 minutos.

### Erro: "undefined field" no Firestore
**Solução**: Já corrigido! Campos opcionais são adicionados condicionalmente.

### Eventos do Google Calendar não aparecem
**Solução**: Já corrigido! Sistema de cache e merge implementado.

### Timezone incorreto (dia -1)
**Solução**: Já corrigido! Datas criadas em timezone local.

## 📚 Documentação

- `CONFIGURACAO_CI_CD.md` - Guia completo de CI/CD
- `CONFIGURACAO_LOCAL.md` - Guia de configuração local
- `firestore.rules` - Regras de segurança do Firestore

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e de uso exclusivo do GJ Santa Terezinha.

---

**Última atualização**: 2026-05-26
**Versão**: 1.0.0
**Status**: ✅ Em Produção
