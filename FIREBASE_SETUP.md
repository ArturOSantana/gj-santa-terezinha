# 🔥 Guia Completo de Configuração do Firebase
## Sistema de Gestão do Grupo de Jovens - Paróquia Santa Terezinha

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Criar Projeto Firebase](#2-criar-projeto-firebase)
3. [Configurar Firebase Authentication](#3-configurar-firebase-authentication)
4. [Configurar Firestore Database](#4-configurar-firestore-database)
5. [Regras de Segurança Firestore](#5-regras-de-segurança-firestore)
6. [Configurar Firebase Hosting](#6-configurar-firebase-hosting)
7. [Instalar Dependências](#7-instalar-dependências)
8. [Configurar Firebase no Projeto](#8-configurar-firebase-no-projeto)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)
10. [Inicializar Firebase CLI](#10-inicializar-firebase-cli)
11. [Estrutura de Dados Firestore](#11-estrutura-de-dados-firestore)
12. [Migração de Dados Mockados](#12-migração-de-dados-mockados)
13. [Configuração de Roles/Permissões](#13-configuração-de-rolespermissões)
14. [Custos e Limites do Plano Gratuito](#14-custos-e-limites-do-plano-gratuito)
15. [Próximos Passos Após Configuração](#15-próximos-passos-após-configuração)
16. [Troubleshooting Comum](#16-troubleshooting-comum)
17. [Comandos Úteis](#17-comandos-úteis)

---

## 1. Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ **Conta Google** ativa (Gmail)
- ✅ **Node.js 18+** instalado ([Download](https://nodejs.org/))
- ✅ **npm** ou **yarn** instalado
- ✅ **Projeto React** já criado (✅ Concluído - `gj-santa-terezinha/`)
- ✅ **Navegador web** atualizado (Chrome, Firefox, Edge)
- ✅ **Editor de código** (VS Code recomendado)

### Verificar instalações:

```bash
node --version  # Deve mostrar v18.x.x ou superior
npm --version   # Deve mostrar 9.x.x ou superior
```

---

## 2. Criar Projeto Firebase

### 2.1 Acessar Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Faça login com sua conta Google
3. Você verá a tela inicial do Firebase

### 2.2 Criar Novo Projeto

1. Clique em **"Adicionar projeto"** ou **"Create a project"**
2. **Nome do projeto:** Digite `gj-santa-terezinha` (ou nome de sua preferência)
   - O Firebase gerará automaticamente um ID único (ex: `gj-santa-terezinha-a1b2c`)
3. Clique em **"Continuar"**

### 2.3 Configurar Google Analytics (Opcional)

1. **Ativar Google Analytics?** 
   - ✅ **Recomendado:** Deixe ativado para métricas de uso
   - ⚠️ **Opcional:** Pode desativar se preferir
2. Se ativado, selecione ou crie uma conta do Google Analytics
3. Aceite os termos e clique em **"Criar projeto"**

### 2.4 Aguardar Criação

- O Firebase levará alguns segundos para provisionar o projeto
- Quando concluído, clique em **"Continuar"**

### 2.5 Registrar Aplicativo Web

1. Na página inicial do projeto, clique no ícone **Web** (`</>`)
2. **Apelido do app:** Digite `GJ Santa Terezinha Web`
3. ✅ **Marque:** "Configurar também o Firebase Hosting"
4. Clique em **"Registrar app"**
5. **IMPORTANTE:** Copie as credenciais que aparecem (vamos usar depois)

```javascript
// Exemplo das credenciais (NÃO use estas - use as suas!)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "gj-santa-terezinha.firebaseapp.com",
  projectId: "gj-santa-terezinha",
  storageBucket: "gj-santa-terezinha.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

6. Clique em **"Continuar no console"**

---

## 3. Configurar Firebase Authentication

### 3.1 Ativar Authentication

1. No menu lateral, clique em **"Authentication"** (🔐)
2. Clique em **"Começar"** ou **"Get started"**
3. Você verá a aba **"Sign-in method"**

### 3.2 Ativar Google OAuth

1. Na lista de provedores, clique em **"Google"**
2. Clique no botão **"Ativar"** (toggle)
3. **Nome público do projeto:** Mantenha o padrão ou personalize
4. **E-mail de suporte:** Selecione seu e-mail
5. Clique em **"Salvar"**

### 3.3 Configurar Domínios Autorizados

1. Ainda em **Authentication**, vá para a aba **"Settings"**
2. Role até **"Authorized domains"**
3. Por padrão, já estarão autorizados:
   - `localhost` (para desenvolvimento)
   - `seu-projeto.firebaseapp.com`
   - `seu-projeto.web.app`
4. **Para adicionar domínio customizado** (futuro):
   - Clique em **"Add domain"**
   - Digite o domínio (ex: `gjsantaterezinha.com.br`)
   - Siga as instruções de verificação DNS

### 3.4 Obter Credenciais OAuth (Opcional - para APIs Google)

> ⚠️ **Nota:** Necessário apenas se for integrar com Google Calendar ou Sheets

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto Firebase criado
3. Vá em **"APIs & Services"** → **"Credentials"**
4. Clique em **"Create Credentials"** → **"OAuth client ID"**
5. **Application type:** Web application
6. **Name:** `GJ Santa Terezinha Web Client`
7. **Authorized JavaScript origins:**
   - `http://localhost:5173` (desenvolvimento)
   - `https://seu-projeto.web.app` (produção)
8. **Authorized redirect URIs:**
   - `http://localhost:5173/__/auth/handler`
   - `https://seu-projeto.web.app/__/auth/handler`
9. Clique em **"Create"**
10. **Copie o Client ID** (vamos usar depois)

### 3.5 Configurar Tela de Consentimento OAuth

1. Ainda no Google Cloud Console
2. Vá em **"OAuth consent screen"**
3. **User Type:** External (para permitir qualquer conta Google)
4. Clique em **"Create"**
5. Preencha:
   - **App name:** Sistema GJ Santa Terezinha
   - **User support email:** Seu e-mail
   - **Developer contact:** Seu e-mail
6. Clique em **"Save and Continue"**
7. **Scopes:** Adicione os escopos necessários:
   - `https://www.googleapis.com/auth/calendar` (Google Calendar)
   - `https://www.googleapis.com/auth/spreadsheets` (Google Sheets)
8. Clique em **"Save and Continue"**
9. **Test users:** Adicione e-mails dos coordenadores
10. Clique em **"Save and Continue"**

---

## 4. Configurar Firestore Database

### 4.1 Criar Banco de Dados

1. No menu lateral do Firebase Console, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**

### 4.2 Escolher Modo de Segurança

Você verá duas opções:

**Opção 1: Modo de Produção (Recomendado)**
- ✅ Escolha esta opção
- Regras de segurança estarão ativas desde o início
- Mais seguro para dados reais

**Opção 2: Modo de Teste**
- ⚠️ Não recomendado para produção
- Permite leitura/escrita sem autenticação por 30 dias
- Use apenas para testes rápidos

**Selecione:** Modo de Produção

### 4.3 Definir Região

1. **Região:** Selecione `southamerica-east1 (São Paulo)`
   - ✅ Melhor latência para usuários no Brasil
   - ✅ Conformidade com LGPD (dados no Brasil)
2. Clique em **"Ativar"** ou **"Enable"**
3. Aguarde alguns segundos enquanto o Firestore é provisionado

### 4.4 Estrutura de Coleções Sugerida

O Firestore será criado vazio. Vamos definir a estrutura de coleções:

```
📁 Firestore Database
├── 📂 members/              # Coleção de membros
│   └── {memberId}           # Documento de cada membro
├── 📂 events/               # Coleção de eventos
│   └── {eventId}            # Documento de cada evento
├── 📂 transactions/         # Coleção de transações financeiras
│   └── {transactionId}      # Documento de cada transação
├── 📂 attendance/           # Coleção de presenças
│   └── {attendanceId}       # Documento de cada registro de presença
├── 📂 users/                # Coleção de usuários do sistema
│   └── {userId}             # Documento de cada usuário (auth)
└── 📂 settings/             # Coleção de configurações
    └── config               # Documento único com configurações gerais
```

> 💡 **Dica:** As coleções serão criadas automaticamente quando você adicionar o primeiro documento.

---

## 5. Regras de Segurança Firestore

### 5.1 Acessar Regras de Segurança

1. No Firestore Database, clique na aba **"Regras"** ou **"Rules"**
2. Você verá o editor de regras

### 5.2 Regras de Segurança Recomendadas

Substitua o conteúdo padrão pelas seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================================================
    // FUNÇÕES AUXILIARES
    // ============================================================================
    
    // Verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verifica se o usuário é o dono do documento
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Verifica se o usuário é coordenador ou admin
    function isCoordinator() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['coordinator', 'admin'];
    }
    
    // Verifica se o usuário é admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ============================================================================
    // REGRAS POR COLEÇÃO
    // ============================================================================
    
    // Coleção: users
    // Usuários podem ler seus próprios dados
    // Coordenadores podem ler todos os usuários
    // Apenas o próprio usuário ou admin pode atualizar
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Coleção: members
    // Todos autenticados podem ler
    // Apenas coordenadores podem criar/editar/deletar
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isCoordinator();
    }
    
    // Coleção: events
    // Todos autenticados podem ler
    // Apenas coordenadores podem criar/editar/deletar
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isCoordinator();
    }
    
    // Coleção: transactions
    // Apenas coordenadores podem ler e escrever
    match /transactions/{transactionId} {
      allow read, write: if isCoordinator();
    }
    
    // Coleção: attendance
    // Todos autenticados podem ler
    // Membros podem criar/atualizar sua própria presença
    // Coordenadores podem fazer tudo
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isCoordinator());
      allow delete: if isCoordinator();
    }
    
    // Coleção: settings
    // Todos autenticados podem ler
    // Apenas admins podem escrever
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### 5.3 Publicar Regras

1. Após colar as regras, clique em **"Publicar"** ou **"Publish"**
2. Aguarde a confirmação de que as regras foram publicadas

### 5.4 Testar Regras (Opcional)

1. Clique na aba **"Regras"** → **"Playground"**
2. Configure um cenário de teste:
   - **Tipo:** `get`
   - **Localização:** `/databases/(default)/documents/members/member123`
   - **Autenticado:** Sim
   - **UID:** `user123`
3. Clique em **"Executar"** para ver se a regra permite ou nega

---

## 6. Configurar Firebase Hosting

### 6.1 Ativar Firebase Hosting

1. No menu lateral, clique em **"Hosting"**
2. Clique em **"Começar"** ou **"Get started"**
3. Siga o assistente (vamos fazer via CLI depois)

### 6.2 Domínio Padrão

Seu projeto terá automaticamente dois domínios gratuitos:
- `https://seu-projeto.web.app`
- `https://seu-projeto.firebaseapp.com`

### 6.3 Configurar Domínio Customizado (Opcional - Futuro)

1. Em **Hosting**, clique em **"Adicionar domínio personalizado"**
2. Digite seu domínio (ex: `gjsantaterezinha.com.br`)
3. Siga as instruções para:
   - Verificar propriedade do domínio
   - Configurar registros DNS (A ou CNAME)
4. Aguarde propagação DNS (pode levar até 24h)

### 6.4 SSL Automático

✅ O Firebase Hosting provisiona automaticamente certificados SSL gratuitos via Let's Encrypt
✅ HTTPS é obrigatório e configurado automaticamente
✅ Renovação automática dos certificados

---

## 7. Instalar Dependências

### 7.1 Instalar Firebase SDK

No diretório do projeto (`gj-santa-terezinha/`), execute:

```bash
npm install firebase
```

Isso instalará o Firebase SDK (versão 10+) que inclui:
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Firebase Cloud Messaging
- E outros serviços

### 7.2 Instalar Firebase CLI (Global)

```bash
npm install -g firebase-tools
```

O Firebase CLI permite:
- Deploy do projeto
- Gerenciar Firestore
- Executar emuladores locais
- Gerenciar regras de segurança

### 7.3 Verificar Instalação

```bash
firebase --version
# Deve mostrar: 13.x.x ou superior
```

### 7.4 Dependências Adicionais (Opcional)

Para funcionalidades avançadas:

```bash
# React Query (cache e sincronização)
npm install @tanstack/react-query

# Date-fns (já instalado no projeto)
# npm install date-fns

# React Hook Form (formulários)
npm install react-hook-form

# Yup (validação)
npm install yup @hookform/resolvers
```

---

## 8. Configurar Firebase no Projeto

### 8.1 Estrutura de Arquivos a Criar

Vamos criar a seguinte estrutura:

```
gj-santa-terezinha/
├── src/
│   ├── config/
│   │   └── firebase.ts              # ⭐ Configuração do Firebase
│   ├── contexts/
│   │   └── AuthContext.tsx          # ⭐ Context de autenticação
│   ├── services/
│   │   ├── firebaseService.ts       # ⭐ Serviços do Firestore
│   │   ├── authService.ts           # ⭐ Serviços de autenticação
│   │   ├── membersService.ts        # Serviços de membros
│   │   ├── eventsService.ts         # Serviços de eventos
│   │   └── transactionsService.ts   # Serviços de transações
│   └── hooks/
│       └── useAuth.ts               # Hook customizado de autenticação
├── .env.local                       # ⭐ Variáveis de ambiente (NÃO COMMITAR!)
├── .env.example                     # Exemplo de variáveis (commitar)
├── firebase.json                    # ⭐ Configuração do Firebase CLI
├── .firebaserc                      # ⭐ Projeto Firebase
└── firestore.rules                  # Regras de segurança (opcional)
```

### 8.2 Criar `src/config/firebase.ts`

```typescript
/**
 * Configuração do Firebase
 * Sistema de Gestão do Grupo de Jovens - Paróquia Santa Terezinha
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase (obtida do Firebase Console)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);

## 9. Variáveis de Ambiente

### 9.1 Criar `.env.local`

No diretório raiz do projeto (`gj-santa-terezinha/`), crie o arquivo `.env.local`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Opcional: Google OAuth Client ID (para APIs)
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

> ⚠️ **IMPORTANTE:** Este arquivo contém informações sensíveis e **NÃO deve ser commitado** no Git!

### 9.2 Criar `.env.example`

Crie um arquivo `.env.example` (este SIM pode ser commitado):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Opcional: Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 9.3 Atualizar `.gitignore`

Certifique-se de que o `.gitignore` inclui:

```
# Environment variables
.env.local
.env.*.local

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
```

### 9.4 Obter Suas Credenciais

1. Volte ao Firebase Console
2. Clique no ícone de engrenagem ⚙️ → **Configurações do projeto**
3. Role até **"Seus aplicativos"**
4. Clique no app web que você criou
5. Copie as credenciais do `firebaseConfig`
6. Cole no seu `.env.local`

---

## 10. Inicializar Firebase CLI

### 10.1 Fazer Login no Firebase

```bash
firebase login
```

- Isso abrirá seu navegador
- Faça login com a mesma conta Google do Firebase Console
- Autorize o Firebase CLI

### 10.2 Inicializar Projeto

No diretório do projeto (`gj-santa-terezinha/`):

```bash
firebase init
```

### 10.3 Selecionar Recursos

Use as setas ↑↓ e ESPAÇO para selecionar:

```
? Which Firebase features do you want to set up?
 ◉ Firestore: Configure security rules and indexes files
 ◯ Functions: Configure a Cloud Functions directory
 ◉ Hosting: Configure files for Firebase Hosting
 ◯ Storage: Configure a security rules file for Cloud Storage
 ◯ Emulators: Set up local emulators
```

Selecione:
- ✅ **Firestore**
- ✅ **Hosting**

Pressione ENTER.

### 10.4 Configurar Firestore

```
? What file should be used for Firestore Rules?
  firestore.rules (default)
```

Pressione ENTER.

```
? What file should be used for Firestore indexes?
  firestore.indexes.json (default)
```

Pressione ENTER.

### 10.5 Configurar Hosting

```
? What do you want to use as your public directory?
  dist
```

Digite `dist` e pressione ENTER (Vite gera o build em `dist/`).

```
? Configure as a single-page app (rewrite all urls to /index.html)?
  Yes
```

Digite `y` e pressione ENTER.

```
? Set up automatic builds and deploys with GitHub?
  No
```

Digite `n` e pressione ENTER (por enquanto).

```
? File dist/index.html already exists. Overwrite?
  No
```

Digite `n` e pressione ENTER.

### 10.6 Arquivos Criados

O Firebase CLI criará:

- ✅ `firebase.json` - Configuração do Firebase
- ✅ `.firebaserc` - Projeto Firebase associado
- ✅ `firestore.rules` - Regras de segurança
- ✅ `firestore.indexes.json` - Índices do Firestore

### 10.7 Verificar `firebase.json`

Abra `firebase.json` e verifique:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 11. Estrutura de Dados Firestore

### 11.1 Coleção: `members`

Armazena informações dos membros do grupo.

```typescript
interface Member {
  id: string;                    // ID único (gerado pelo Firestore)
  name: string;                  // Nome completo
  email: string;                 // E-mail
  phone: string;                 // Telefone (formato: "(11) 98765-4321")
  birthDate: Timestamp;          // Data de nascimento
  gender: 'male' | 'female';     // Gênero (rapazes/moças)
  joinDate: Timestamp;           // Data de entrada no grupo
  status: 'active' | 'inactive' | 'suspended'; // Status do membro
  photoUrl?: string;             // URL da foto (Firebase Storage)
  address?: {                    // Endereço (opcional)
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {           // Contato de emergência (opcional)
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;                // Observações
  createdAt: Timestamp;          // Data de criação do registro
  updatedAt: Timestamp;          // Data da última atualização
}
```

**Exemplo de documento:**

```json
{
  "name": "João Pedro Silva",
  "email": "joao.silva@email.com",
  "phone": "(11) 98765-4321",
  "birthDate": "2004-03-15T00:00:00Z",
  "gender": "male",
  "joinDate": "2023-01-10T00:00:00Z",
  "status": "active",
  "photoUrl": "https://storage.googleapis.com/...",
  "createdAt": "2023-01-10T10:30:00Z",
  "updatedAt": "2026-05-15T14:20:00Z"
}
```

### 11.2 Coleção: `events`

Armazena eventos e encontros do grupo.

```typescript
interface Event {
  id: string;                    // ID único
  title: string;                 // Título do evento
  description: string;           // Descrição
  date: Timestamp;               // Data do evento
  startTime: string;             // Hora de início (formato: "18:00")
  endTime: string;               // Hora de término (formato: "21:15")
  location: string;              // Local do evento
  saturdayType: 1 | 2 | 3 | 4;   // Tipo de sábado (1º, 2º, 3º, 4º)
  isSpecialEvent: boolean;       // É evento especial?
  attendees: string[];           // IDs dos membros presentes
  attendance: {                  // Mapa de presenças
    [memberId: string]: 'present' | 'absent' | 'justified';
  };
  notes?: string;                // Observações
  createdAt: Timestamp;          // Data de criação
  updatedAt: Timestamp;          // Data de atualização
}
```

### 11.3 Coleção: `transactions`

Armazena transações financeiras (receitas e despesas).

```typescript
interface Transaction {
  id: string;                    // ID único
  type: 'income' | 'expense';    // Tipo (entrada/saída)
  category: string;              // Categoria
  amount: number;                // Valor (em reais)
  description: string;           // Descrição
  date: Timestamp;               // Data da transação
  memberId?: string;             // ID do membro relacionado (opcional)
  eventId?: string;              // ID do evento relacionado (opcional)
  paymentMethod?: string;        // Método de pagamento
  receipt?: string;              // URL do comprovante (Firebase Storage)
  notes?: string;                // Observações
  createdAt: Timestamp;          // Data de criação
  updatedAt: Timestamp;          // Data de atualização
}
```

### 11.4 Coleção: `users`

Armazena dados dos usuários autenticados (vinculados ao Firebase Auth).

```typescript
interface User {
  id: string;                    // ID do usuário (mesmo do Firebase Auth)
  email: string;                 // E-mail
  displayName: string;           // Nome de exibição
  role: 'admin' | 'coordinator' | 'member'; // Papel no sistema
  memberId?: string;             // ID do membro (se aplicável)
  photoUrl?: string;             // URL da foto
  createdAt: Timestamp;          // Data de criação
  lastLogin?: Timestamp;         // Último login
}
```

---

## 12. Migração de Dados Mockados

### 12.1 Estratégia de Migração

Você tem duas opções:

**Opção A: Migração Completa**
- Migrar todos os dados mockados para o Firestore
- Remover dados mockados do código
- Usar apenas Firestore em produção

**Opção B: Modo Híbrido (Recomendado para desenvolvimento)**
- Manter dados mockados como fallback
- Usar Firestore quando disponível
- Facilita desenvolvimento offline

### 12.2 Criar Script de Migração

Crie o arquivo `src/utils/migrateData.ts`:

```typescript
/**
 * Script de Migração de Dados Mockados para Firestore
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { mockMembers, mockEvents, mockTransactions } from './mockData';

const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const migrateMembers = async () => {
  console.log('🔄 Migrando membros...');
  
  for (const member of mockMembers) {
    const { id, birthDate, joinDate, createdAt, updatedAt, ...rest } = member;
    
    await addDoc(collection(db, 'members'), {
      ...rest,
      birthDate: dateToTimestamp(birthDate),
      joinDate: dateToTimestamp(joinDate),
      createdAt: dateToTimestamp(createdAt),
      updatedAt: dateToTimestamp(updatedAt),
    });
  }
  
  console.log(`✅ ${mockMembers.length} membros migrados!`);
};

export const migrateEvents = async () => {
  console.log('🔄 Migrando eventos...');
  
  for (const event of mockEvents) {
    const { id, date, createdAt, updatedAt, ...rest } = event;
    
    await addDoc(collection(db, 'events'), {
      ...rest,
      date: dateToTimestamp(date),
      createdAt: dateToTimestamp(createdAt),
      updatedAt: dateToTimestamp(updatedAt),
    });
  }
  
  console.log(`✅ ${mockEvents.length} eventos migrados!`);
};

export const migrateTransactions = async () => {
  console.log('🔄 Migrando transações...');
  
  for (const transaction of mockTransactions) {
    const { id, date, createdAt, updatedAt, ...rest } = transaction;
    
    await addDoc(collection(db, 'transactions'), {
      ...rest,
      date: dateToTimestamp(date),
      createdAt: dateToTimestamp(createdAt),
      updatedAt: dateToTimestamp(updatedAt),
    });
  }
  
  console.log(`✅ ${mockTransactions.length} transações migradas!`);
};

export const migrateAll = async () => {
  try {
    console.log('🚀 Iniciando migração de dados...\n');
    
    await migrateMembers();
    await migrateEvents();
    await migrateTransactions();
    
    console.log('\n✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
};
```

### 12.3 Executar Migração

Adicione um botão temporário na interface:

```typescript
// Em algum componente (ex: Dashboard)
import { migrateAll } from '../utils/migrateData';

<Button onClick={migrateAll} variant="contained" color="warning">
  Migrar Dados Mockados para Firestore
</Button>
```

### 12.4 Modo Híbrido (Fallback)

Mantenha dados mockados como fallback durante desenvolvimento:

```typescript
// Em hooks/useMembers.ts
export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Tentar buscar do Firestore
        const data = await getAll<Member>('members');
        setMembers(data.length > 0 ? data : mockMembers);
      } catch (error) {
        console.warn('Usando dados mockados:', error);
        setMembers(mockMembers);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return { members, loading };
};
```

---

## 13. Configuração de Roles/Permissões

### 13.1 Sistema de Permissões

O sistema terá 3 níveis de acesso:

| Role | Permissões |
|------|-----------|
| **Admin** | Acesso total ao sistema, incluindo configurações e gerenciamento de usuários |
| **Coordinator** | Gerenciar eventos, membros, finanças e presenças |
| **Member** | Visualizar eventos, confirmar presença, ver informações básicas |

### 13.2 Definir Role no Primeiro Login

Crie `src/services/authService.ts`:

```typescript
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  role: 'admin' | 'coordinator' | 'member' = 'member'
): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  
  // Verificar se usuário já existe
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Criar novo perfil
    await setDoc(userRef, {
      email,
      displayName,
      role,
      createdAt: new Date(),
      lastLogin: new Date(),
    });
  } else {
    // Atualizar último login
    await setDoc(userRef, {
      lastLogin: new Date(),
    }, { merge: true });
  }
};

export const getUserRole = async (uid: string): Promise<string> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data().role;
  }
  
  return 'member'; // Role padrão
};
```

### 13.3 Definir Primeiro Admin

**Manualmente no Firestore Console:**

1. Acesse Firestore Database
2. Crie a coleção `users`
3. Adicione um documento com o UID do primeiro admin:
   - **ID do documento:** UID do usuário (obtido após primeiro login)
   - **Campos:**
     - `email`: "admin@email.com"
     - `displayName`: "Administrador"
     - `role`: "admin"
     - `createdAt`: (timestamp atual)

**Ou via código (após primeiro login):**

```typescript
// Execute uma vez para promover usuário a admin
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';

const promoteToAdmin = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role: 'admin'
  });
  console.log('✅ Usuário promovido a admin!');
};

// Executar com o UID do primeiro admin
promoteToAdmin('uid-do-primeiro-admin');
```

---

## 14. Custos e Limites do Plano Gratuito

### 14.1 Firebase Spark Plan (Gratuito)

| Serviço | Limite Gratuito | Uso Estimado (100 usuários) | Status |
|---------|-----------------|------------------------------|--------|
| **Firestore** | | | |
| - Leituras | 50.000/dia | ~1.000/dia | ✅ Suficiente |
| - Escritas | 20.000/dia | ~500/dia | ✅ Suficiente |
| - Exclusões | 20.000/dia | ~100/dia | ✅ Suficiente |
| - Armazenamento | 1 GB | ~50 MB | ✅ Suficiente |
| **Authentication** | Ilimitado | 100 usuários | ✅ Suficiente |
| **Hosting** | | | |
| - Armazenamento | 10 GB | ~100 MB | ✅ Suficiente |
| - Transferência | 360 MB/dia | ~50 MB/dia | ✅ Suficiente |
| **Storage** | 5 GB | ~500 MB | ✅ Suficiente |
| **Cloud Functions** | 125.000/mês | ~10.000/mês | ✅ Suficiente |

### 14.2 Estimativa de Uso Real

**Cenário: 100 usuários ativos, 4 eventos/mês**

- **Leituras Firestore:** ~30.000/mês (1.000/dia)
  - Dashboard: 10 leituras/usuário/dia
  - Calendário: 5 leituras/usuário/dia
  - Membros: 3 leituras/usuário/dia

- **Escritas Firestore:** ~15.000/mês (500/dia)
  - Presenças: 400 escritas/mês
  - Transações: 50 escritas/mês
  - Atualizações: 50 escritas/mês

- **Hosting:** ~1.5 GB/mês (50 MB/dia)
  - Build size: ~2 MB
  - 25 acessos/dia × 2 MB = 50 MB/dia

**Conclusão:** O plano gratuito é MAIS que suficiente! 🎉

### 14.3 Dicas para Otimizar Uso

**1. Minimizar Leituras:**
```typescript
// ❌ Ruim: Múltiplas leituras
const member1 = await getDoc(doc(db, 'members', 'id1'));
const member2 = await getDoc(doc(db, 'members', 'id2'));

// ✅ Bom: Leitura em lote
const members = await getDocs(
  query(collection(db, 'members'), where(documentId(), 'in', ['id1', 'id2']))
);
```

**2. Cache Agressivo:**
```typescript
// React Query com cache longo
useQuery({
  queryKey: ['members'],
  queryFn: fetchMembers,
  staleTime: 10 * 60 * 1000, // 10 min
  cacheTime: 30 * 60 * 1000, // 30 min
});
```

**3. Comprimir Imagens:**
```typescript
const compressImage = async (file: File) => {
  return await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800
  });
};
```

### 14.4 Monitoramento de Uso

1. Acesse Firebase Console
2. Vá em **"Usage and billing"**
3. Monitore:
   - Leituras/escritas do Firestore
   - Transferência do Hosting
   - Armazenamento usado

---

## 15. Próximos Passos Após Configuração

### 15.1 Implementar AuthContext

✅ Criar `src/contexts/AuthContext.tsx` completo
✅ Implementar login com Google
✅ Implementar logout
✅ Gerenciar estado de autenticação

### 15.2 Criar Serviços Firestore

✅ `src/services/membersService.ts` - CRUD de membros
✅ `src/services/eventsService.ts` - CRUD de eventos
✅ `src/services/transactionsService.ts` - CRUD de transações
✅ `src/services/attendanceService.ts` - Controle de presença

### 15.3 Atualizar Hooks

Modificar hooks existentes para usar Firebase:
- ✅ `useDashboard.ts` - Buscar dados do Firestore
- ✅ `useMembers.ts` - CRUD de membros
- ✅ `useCalendar.ts` - CRUD de eventos
- ✅ `useFinance.ts` - CRUD de transações

### 15.4 Adicionar Loading States

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Mostrar LoadingSpinner enquanto carrega
if (loading) return <LoadingSpinner />;
if (error) return <Alert severity="error">{error}</Alert>;
```

### 15.5 Tratamento de Erros

```typescript
try {
  await createMember(data);
  showSuccessMessage('Membro criado com sucesso!');
} catch (error) {
  console.error('Erro ao criar membro:', error);
  showErrorMessage('Erro ao criar membro. Tente novamente.');
}
```

### 15.6 Deploy Inicial

```bash
# Build do projeto
npm run build

# Deploy no Firebase Hosting
firebase deploy

# Acessar: https://seu-projeto.web.app
```

---

## 16. Troubleshooting Comum

### 16.1 Erro de CORS

**Problema:** `Access to fetch at 'https://firestore.googleapis.com' has been blocked by CORS policy`

**Solução:**
- Verifique se o domínio está autorizado em Authentication → Settings → Authorized domains
- Para localhost, certifique-se de que `localhost` está na lista

### 16.2 Regras de Segurança Bloqueando

**Problema:** `FirebaseError: Missing or insufficient permissions`

**Solução:**
1. Verifique se o usuário está autenticado
2. Verifique se o role do usuário está correto no Firestore
3. Teste as regras no Playground do Firestore
4. Temporariamente, use regras permissivas para debug:

```javascript
// ⚠️ APENAS PARA DEBUG - NÃO USE EM PRODUÇÃO
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

### 16.3 Variáveis de Ambiente Não Carregando

**Problema:** `undefined` ao acessar `import.meta.env.VITE_FIREBASE_API_KEY`

**Solução:**
1. Certifique-se de que o arquivo `.env.local` existe
2. Variáveis devem começar com `VITE_`
3. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

### 16.4 Build Falhando

**Problema:** Erro ao executar `npm run build`

**Solução:**
1. Verifique erros de TypeScript:
```bash
npm run lint
```

2. Limpe cache e reinstale:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### 16.5 Firebase CLI Não Reconhecido

**Problema:** `firebase: command not found`

**Solução:**
```bash
# Reinstalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalação
firebase --version
```

### 16.6 Erro ao Fazer Deploy

**Problema:** `Error: HTTP Error: 403, The caller does not have permission`

**Solução:**
1. Fazer logout e login novamente:
```bash
firebase logout
firebase login
```

2. Verificar projeto selecionado:
```bash
firebase use --add
```

---

## 17. Comandos Úteis

### 17.1 Firebase CLI

```bash
# Login/Logout
firebase login
firebase logout

# Listar projetos
firebase projects:list

# Selecionar projeto
firebase use <project-id>

# Deploy completo
firebase deploy

# Deploy apenas Hosting
firebase deploy --only hosting

# Deploy apenas Firestore Rules
firebase deploy --only firestore:rules

# Deploy apenas Functions
firebase deploy --only functions
```

### 17.2 Emuladores Locais

```bash
# Iniciar emuladores
firebase emulators:start

# Emuladores específicos
firebase emulators:start --only firestore,auth

# Exportar dados dos emuladores
firebase emulators:export ./emulator-data

# Importar dados nos emuladores
firebase emulators:start --import=./emulator-data
```

### 17.3 Firestore

```bash
# Exportar dados do Firestore
firebase firestore:export gs://seu-bucket/backup

# Importar dados para o Firestore
firebase firestore:import gs://seu-bucket/backup

# Deletar coleção (cuidado!)
firebase firestore:delete --all-collections
```

### 17.4 Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

### Tutoriais e Guias

- [Get Started with Firebase for Web](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase with React](https://firebase.google.com/docs/web/setup#add-sdks-initialize)

### Comunidade

- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase YouTube Channel](https://www.youtube.com/firebase)

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo foi configurado corretamente:

### Firebase Console
- [ ] Projeto Firebase criado
- [ ] App Web registrado
- [ ] Authentication ativado (Google OAuth)
- [ ] Firestore Database criado (região São Paulo)
- [ ] Regras de segurança publicadas
- [ ] Firebase Hosting ativado

### Projeto Local
- [ ] Firebase SDK instalado (`npm install firebase`)
- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Arquivo `.env.local` criado com credenciais
- [ ] Arquivo `src/config/firebase.ts` criado
- [ ] Firebase CLI inicializado (`firebase init`)
- [ ] Arquivos `firebase.json` e `.firebaserc` criados

### Código
- [ ] AuthContext implementado
- [ ] Serviços Firestore criados
- [ ] Hooks atualizados para usar Firebase
- [ ] Loading states adicionados
- [ ] Tratamento de erros implementado

### Deploy
- [ ] Build executado com sucesso (`npm run build`)
- [ ] Deploy realizado (`firebase deploy`)
- [ ] Site acessível em `https://seu-projeto.web.app`

---

## 🎉 Conclusão

Parabéns! Você configurou com sucesso o Firebase para o Sistema de Gestão do Grupo de Jovens. 

**Próximos passos:**
1. Implementar o código de autenticação e serviços
2. Migrar dados mockados para o Firestore
3. Testar todas as funcionalidades
4. Fazer o deploy inicial

**Lembre-se:**
- 💰 O plano gratuito é suficiente para o projeto
- 🔒 Mantenha as credenciais seguras (`.env.local`)
- 📊 Monitore o uso no Firebase Console
- 🚀 Faça deploys frequentes para testar em produção

---

**Documento criado em:** 19 de maio de 2026  
**Versão:** 1.0  
**Projeto:** Sistema de Gestão do Grupo de Jovens - Paróquia Santa Terezinha

**Desenvolvido com ❤️ para o Grupo de Jovens**
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurar provedor Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Opcional: Adicionar escopos para Google Calendar e Sheets (futuro)
// googleProvider.addScope('https://www.googleapis.com/auth/calendar');
// googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

export default app;
```

---

*Continua na próxima seção...*