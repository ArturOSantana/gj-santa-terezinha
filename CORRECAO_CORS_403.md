# Correção CORS 403 - Firebase Functions

## Problema Identificado

**Erro:** CORS 403 (Forbidden) ao chamar Functions em produção
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at https://us-central1-gj-santaterezinha.cloudfunctions.net/...
(Reason: CORS header 'Access-Control-Allow-Origin' missing). Status code: 403.
```

## Causas Possíveis

### 1. Frontend não está autenticado corretamente
O erro 403 indica que o usuário não tem permissão para chamar a Function.

### 2. Variáveis de ambiente não configuradas no Vercel
O frontend em produção pode não ter as credenciais do Firebase.

### 3. Região da Function diferente
O código pode estar tentando chamar a Function na região errada.

## Solução Passo a Passo

### PASSO 1: Verificar Variáveis de Ambiente no Vercel

1. Acessar: https://vercel.com/seu-usuario/gj-santa-terezinha/settings/environment-variables

2. Verificar se TODAS as variáveis estão configuradas:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=gj-santaterezinha.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gj-santaterezinha
VITE_FIREBASE_STORAGE_BUCKET=gj-santaterezinha.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. Se faltarem variáveis, adicionar e fazer redeploy

### PASSO 2: Verificar Região das Functions

O código atual usa a região padrão (us-central1). Verificar se está correto:

```bash
firebase functions:list
```

Todas devem estar em `us-central1`.

### PASSO 3: Adicionar Configuração de Região Explícita

Editar `src/config/firebase.ts` para especificar a região:

```typescript
export const functions = getFunctions(app, 'us-central1');
```

### PASSO 4: Verificar Autenticação

O erro 403 geralmente significa que o usuário não está autenticado ou não tem permissão.

**Verificar:**
1. Usuário está logado?
2. Token de autenticação é válido?
3. Usuário tem role de admin ou coordinator?

### PASSO 5: Testar Localmente Primeiro

Antes de fazer deploy, testar localmente:

```bash
# Parar emuladores
pkill -f firebase

# Iniciar apenas frontend (sem emulators)
npm run dev

# Testar se conecta às Functions em produção
```

Se funcionar localmente mas não em produção, o problema é nas variáveis de ambiente do Vercel.

## Correção Rápida

### Opção A: Especificar Região Explicitamente

```typescript
// src/config/firebase.ts
import { getFunctions } from 'firebase/functions';

export const functions = getFunctions(app, 'us-central1');
```

### Opção B: Remover Conexão com Emulators em Produção

```typescript
// src/config/firebase.ts
if (import.meta.env.DEV && import.meta.env.MODE === 'development') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
```

### Opção C: Adicionar Logs de Debug

```typescript
// src/services/boanova.service.ts
async startWhatsAppSession() {
  console.log('Iniciando sessão WhatsApp...');
  console.log('Functions URL:', functions.app.options);
  console.log('Auth:', auth.currentUser);
  
  const startSession = httpsCallable(functions, 'startWhatsAppSession');
  // ...
}
```

## Comandos para Aplicar Correção

```bash
# 1. Editar arquivo
nano src/config/firebase.ts

# 2. Fazer build
npm run build

# 3. Commit e push
git add .
git commit -m "fix: especificar região us-central1 para Functions"
git push origin main

# 4. Aguardar deploy automático no Vercel (2-3 minutos)

# 5. Testar em produção
open https://gjsantaterezinha.vercel.app
```

## Verificação Pós-Correção

### 1. Verificar Console do Navegador
Abrir DevTools (F12) e verificar:
- Não deve ter erros CORS
- Requisições devem retornar 200 (OK)
- Token de autenticação deve estar presente

### 2. Verificar Logs das Functions
```bash
firebase functions:log
```

Deve mostrar as chamadas sendo recebidas.

### 3. Testar Funcionalidades
1. Login como admin/coordenador
2. Ir para "Boa Nova"
3. Clicar em "Verificar Serviço"
4. Deve funcionar sem erro

## Se o Problema Persistir

### Verificar IAM Permissions

1. Acessar: https://console.cloud.google.com/iam-admin/iam?project=gj-santaterezinha

2. Verificar se o serviço tem permissões:
   - Cloud Functions Invoker
   - Firebase Admin

### Verificar Firestore Rules

```bash
cat firestore.rules
```

Verificar se as regras permitem leitura/escrita para usuários autenticados.

### Habilitar CORS Manualmente (Última Opção)

Se nada funcionar, adicionar CORS manualmente nas Functions:

```typescript
// functions/src/index.ts
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

export const sendEmailBroadcast = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // código da function
  });
});
```

**Nota:** Isso requer mudar de `onCall` para `onRequest`, o que quebra a compatibilidade.

## Resumo

**Causa mais provável:** Variáveis de ambiente não configuradas no Vercel

**Solução mais rápida:** 
1. Adicionar variáveis no Vercel
2. Especificar região explicitamente
3. Fazer redeploy

**Tempo estimado:** 10-15 minutos