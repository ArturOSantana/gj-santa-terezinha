# GJ Santa Terezinha — Sistema de Gestão + Agenda Pública

Sistema completo de gestão e comunicação para o Grupo de Jovens da Paróquia Santa Terezinha do Menino Jesus, composto por dois ambientes: um **painel interno de gestão (Terezinha OS)** e uma **agenda pública** acessível a qualquer jovem sem login.

- **Produção:** https://gj-santaterezinha.web.app
- **Console Firebase:** https://console.firebase.google.com/project/gj-santaterezinha

---

## O que é este projeto

O sistema é dividido em duas partes que convivem no mesmo repositório e hospedagem:

### 1. Agenda Pública (`/agenda`)
Página pública, sem login, feita para os jovens acompanharem a programação do grupo no celular.

- **Próximo evento** em destaque com arte e informações
- **Filtros por categoria**: Paróquia, Jovens, Crisma, TLC, Catequese, Oratório, Perseverança, Servidores
- **Visualização em lista** (próximos eventos) e **calendário mensal**
- **Aniversariantes do mês** com destaque para o dia de hoje
- **Avisos da coordenação** em tempo real (Firestore), com suporte a urgência e vencimento
- **Novenas do dia**: botão flutuante (FAB) que abre sheet com a novena em andamento, oração do dia atual, oração inicial e oração final
- **Temas festivos automáticos**: o visual da página muda conforme o santo da novena/festa em andamento (Santa Terezinha, São José, Pier Giorgio Frassati, Santo Inácio, Carlos Acutis, Santa Joana d'Arc, Nossa Senhora)
- **Painel da coordenação**: admins publicam avisos e gerenciam temas via painel acessível por senha, diretamente na página pública

**Fontes de dados da Agenda:**
| Dado | Fonte |
|---|---|
| Eventos | Google Sheets (leitura pública) |
| Aniversariantes | Google Calendar (leitura pública) |
| Avisos | Firestore (tempo real) |
| Temas festivos | Firestore + padrão hardcoded por data |
| Novenas | API externa (`api-novenas.vercel.app`) |

---

### 2. Terezinha OS — Painel Interno de Gestão
Painel restrito à liderança (admin, coordenador, líder), acessado via login Firebase.

| Módulo | O que faz |
|---|---|
| **Dashboard** | Visão geral de membros, eventos e finanças com indicadores em tempo real |
| **Pessoas** | Cadastro de jovens com dados biográficos, responsáveis, status e consentimento LGPD |
| **Membros** | Gestão de permissões e papéis no grupo |
| **Usuários** | Gerenciamento de acessos ao painel (roles: admin, coordinator, leader) |
| **Eventos** | Criação, edição e sincronização com Google Calendar |
| **Calendário** | Visualização integrada com Google Calendar |
| **Escalas** | Atribuição de funções por evento, confirmação via link público no WhatsApp |
| **Presença** | Check-in por QR Code ou manual vinculado a eventos |
| **Tarefas** | Checklist de tarefas por evento com responsável e prioridade |
| **Atas** | Registro de reuniões com pauta e decisões |
| **Finanças** | Controle de caixa em centavos com comprovantes e vínculo por evento |
| **Documentos** | Upload de arquivos com visibilidade controlada |
| **Boa Nova** | Comunicação em massa por e-mail (Nodemailer) e WhatsApp (Baileys) |
| **Inscrições** | Normalização de inscrições externas (Google Sheets / API externa) |
| **Relatórios** | Exportação e consolidação de dados |

---

## Tecnologias

### Frontend
- **React 19** + **TypeScript**
- **Vite** — build tool
- **Material-UI (MUI 9)** — componentes do painel interno
- **CSS nativo** — agenda pública (zero dependências de UI, mobile-first)
- **React Router 7** — navegação

### Backend / Infraestrutura
- **Firebase Auth** — autenticação RBAC fail-closed (sem auto-provisionamento)
- **Firestore** — avisos, temas festivos, membros, eventos, finanças
- **Firebase Storage** — upload de comprovantes e documentos
- **Firebase Functions** (Node.js 20) — Google Calendar, Boa Nova, jobs agendados
- **Firebase Hosting** — hospedagem do frontend

### Integrações externas
- **Google Calendar API** — eventos do painel interno
- **Google Sheets** — eventos da agenda pública (somente leitura)
- **API de Novenas** (`api-novenas.vercel.app`) — conteúdo diário das novenas
- **Nodemailer** — e-mail em massa
- **Baileys** — WhatsApp Web API

---

## Estrutura do Projeto

```
gj-santa-terezinha/
├── src/
│   ├── pages/
│   │   ├── Agenda/              ← Agenda pública (sem login)
│   │   │   ├── AgendaPage.tsx   ← Página principal
│   │   │   ├── AdminPanel.tsx   ← Painel da coordenação (dialog)
│   │   │   ├── NovenaSection.tsx← FAB + sheet de novenas
│   │   │   ├── EventDetailModal.tsx
│   │   │   ├── HeroDecoration.tsx
│   │   │   ├── CrestPlate.tsx
│   │   │   └── agenda.css       ← Todo o CSS da agenda pública
│   │   ├── Dashboard/
│   │   ├── People/
│   │   ├── Members/
│   │   ├── Users/
│   │   ├── Events/
│   │   ├── Calendar/
│   │   ├── Schedules/
│   │   ├── Attendance/
│   │   ├── Tasks/
│   │   ├── Meetings/
│   │   ├── Finance/
│   │   ├── Documents/
│   │   ├── BoaNova/
│   │   ├── Contributions/
│   │   ├── Reports/
│   │   ├── PublicHome/          ← Página pública de configuração
│   │   ├── PublicCalendar/
│   │   ├── PublicEventInvitation/
│   │   ├── PublicAttendanceCheckin/
│   │   └── PublicScheduleResponse/
│   ├── hooks/
│   │   ├── useNovena.ts         ← Novenas do dia + calendário anual
│   │   ├── useFeastTheme.ts     ← Tema festivo ativo (automático + Firestore)
│   │   └── ...
│   ├── services/
│   │   ├── agenda.service.ts    ← Sheets, Calendar, avisos Firestore
│   │   ├── novena.service.ts    ← API de novenas + progresso localStorage
│   │   ├── theme.service.ts     ← Resolução de temas festivos
│   │   └── ...
│   ├── types/
│   │   ├── agenda.types.ts
│   │   ├── novena.types.ts
│   │   └── theme.types.ts
│   └── contexts/
│       └── AuthContext.tsx      ← Auth fail-closed (sem auto-provisionamento)
├── functions/                   ← Firebase Functions
│   └── src/
│       ├── boanova/             ← Email + WhatsApp
│       ├── googleCalendar.ts
│       └── index.ts
├── firestore.rules
├── firebase.json
└── .github/workflows/           ← CI/CD (GitHub Actions → Firebase Hosting)
```

---

## Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 20+
- Firebase CLI
- Conta Firebase no plano Blaze

### 1. Clone e instale
```bash
git clone <repositorio>
cd gj-santa-terezinha
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp src/config/.env.example src/config/.env
# Preencha com as credenciais do Firebase
```

As variáveis necessárias são:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_SHEETS_URL          ← URL pública da planilha de eventos (CSV)
VITE_CALENDAR_ID         ← Google Calendar ID para aniversariantes
VITE_NOVENA_API_URL      ← https://api-novenas.vercel.app
```

### 3. Rode localmente
```bash
npm run dev
```

---

## Deploy

### Automático (push para `main`)
O GitHub Actions faz build e deploy automaticamente a cada push.

```bash
git add .
git commit -m "feat: descrição da mudança"
git push origin main
# Deploy em ~2-3 minutos
```

### Manual
```bash
npm run build
firebase deploy --only hosting
```

---

## Segurança e RBAC

- **Sem auto-provisionamento:** login bem-sucedido no Firebase Auth sem documento `users/{uid}` = acesso negado
- **Roles:** `admin` › `coordinator` › `leader` (jovens são `people`, sem credencial)
- **Firestore Rules:** leitura/escrita condicional por role em todas as coleções administrativas
- **Dados de menores:** campos sensíveis (`guardianName`, `birthDate`, `emergencyContact`) restritos por role
- **Tokens de escala:** `publicTokenHash` criptográfico com expiração para confirmação via WhatsApp sem login

---

## Firebase Functions

### Boa Nova (comunicação)
| Function | Descrição |
|---|---|
| `sendEmailBroadcast` | Envio de e-mails em massa (Nodemailer) |
| `verifyEmail` | Verifica configuração de e-mail |
| `startWhatsAppSession` | Inicia sessão WhatsApp (QR Code) |
| `checkWhatsAppSession` | Verifica status da sessão |
| `endWhatsAppSession` | Encerra sessão |
| `sendWhatsAppBroadcast` | Envio de mensagens WhatsApp (Baileys) |

### Google Calendar
| Function | Descrição |
|---|---|
| `getCalendarEvents` | Busca eventos |
| `createCalendarEvent` | Cria evento |
| `updateCalendarEvent` | Atualiza evento |
| `deleteCalendarEvent` | Remove evento |

### Agendadas
| Function | Descrição |
|---|---|
| `cleanupOldBroadcasts` | Limpa broadcasts antigos (diário) |
| `cleanupExpiredWhatsAppSessions` | Limpa sessões expiradas (1h) |

---

## Documentação adicional

| Arquivo | Conteúdo |
|---|---|
| `CONFIGURACAO_LOCAL.md` | Configuração do ambiente local |
| `CONFIGURACAO_CI_CD.md` | Guia de CI/CD com GitHub Actions |
| `AGENDA_FIRESTORE_RULES.md` | Regras Firestore da agenda pública |
| `AGENDA_GOOGLE_SHEETS.md` | Estrutura da planilha de eventos |
| `terezinha-os-plan.md` | Plano de arquitetura do Terezinha OS (V2) |
| `firestore.rules` | Regras de segurança em produção |

---

**Última atualização:** 2025-07-15
**Versão:** 2.0.0
**Status:** ✅ Em Produção
