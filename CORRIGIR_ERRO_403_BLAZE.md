# Corrigir Erro 403 - Já no Blaze Plan

## Problema

Você já está no Blaze Plan, mas ainda recebe erro 403 ao chamar Functions:

```
CORS header 'Access-Control-Allow-Origin' missing. Status code: 403
```

## Causa

As Firebase Functions estão configuradas como **privadas** por padrão e requerem autenticação. O erro 403 significa que o usuário não tem permissão para invocar as Functions.

## Possíveis Causas

### 1. Usuário não está autenticado no frontend
O token de autenticação não está sendo enviado corretamente.

### 2. Permissões IAM não configuradas
As Functions não têm permissão para serem invocadas por usuários autenticados.

### 3. Functions não foram deployadas corretamente
As Functions podem não estar ativas em produção.

---

## Solução 1: Verificar Autenticação

### Passo 1: Verificar se usuário está logado

Abra o console do navegador (F12) em https://gj-santaterezinha.web.app e execute:

```javascript
// Verificar se há usuário logado
firebase.auth().currentUser

// Deve retornar objeto com email, uid, etc.
// Se retornar null, o usuário não está autenticado
```

### Passo 2: Verificar token de autenticação

```javascript
// Pegar token
firebase.auth().currentUser.getIdToken().then(token => console.log(token))

// Deve retornar um token JWT longo
```

### Passo 3: Fazer logout e login novamente

1. Fazer logout
2. Fazer login como admin ou coordenador
3. Tentar novamente

---

## Solução 2: Tornar Functions Públicas (Temporário)

**ATENÇÃO:** Isso torna as Functions públicas. Use apenas para teste!

### Via Console do Firebase:

1. Acessar: https://console.cloud.google.com/functions/list?project=gj-santaterezinha

2. Para cada Function (sendEmailBroadcast, verifyEmail, etc.):
   - Clicar na Function
   - Ir em "Permissions" (Permissões)
   - Clicar em "Add Principal" (Adicionar principal)
   - Principal: `allUsers`
   - Role: `Cloud Functions Invoker`
   - Salvar

### Via Firebase CLI:

```bash
# Instalar gcloud CLI primeiro
brew install google-cloud-sdk

# Autenticar
gcloud auth login

# Tornar Functions públicas (uma por vez)
gcloud functions add-iam-policy-binding sendEmailBroadcast \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=gj-santaterezinha

gcloud functions add-iam-policy-binding verifyEmail \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=gj-santaterezinha

gcloud functions add-iam-policy-binding startWhatsAppSession \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=gj-santaterezinha

# Repetir para todas as 8 Functions
```

### Testar:

Após tornar públicas, testar em https://gj-santaterezinha.web.app

Se funcionar, o problema era de permissões IAM.

---

## Solução 3: Verificar se Functions estão ativas

```bash
# Listar Functions
firebase functions:list

# Deve mostrar 8 Functions ativas
# Se não mostrar, fazer redeploy:
firebase deploy --only functions
```

---

## Solução 4: Verificar Logs das Functions

```bash
# Ver logs
firebase functions:log

# Ver logs de uma Function específica
firebase functions:log --only sendEmailBroadcast

# Procurar por erros de autenticação
```

---

## Solução 5: Redeployar Functions com CORS

Se nada funcionar, adicionar CORS manualmente:

### Editar functions/src/index.ts:

```typescript
import * as cors from 'cors';

const corsHandler = cors({ 
  origin: [
    'https://gj-santaterezinha.web.app',
    'https://gj-santaterezinha.firebaseapp.com',
    'http://localhost:5173'
  ],
  credentials: true 
});

// Exemplo para sendEmailBroadcast
export const sendEmailBroadcast = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Verificar autenticação manualmente
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Verificar permissões
      const userDoc = await admin.firestore()
        .collection('members')
        .doc(decodedToken.uid)
        .get();
      
      const userRole = userDoc.data()?.role;
      if (userRole !== 'admin' && userRole !== 'coordinator') {
        res.status(403).json({ error: 'Sem permissão' });
        return;
      }

      // Lógica da Function
      // ...
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
```

**Nota:** Isso requer mudar de `onCall` para `onRequest` e atualizar o frontend.

---

## Solução Recomendada

### Passo 1: Verificar Autenticação

1. Abrir https://gj-santaterezinha.web.app
2. Abrir DevTools (F12)
3. Ir para aba "Application" → "Local Storage"
4. Verificar se há chaves do Firebase Auth
5. Se não houver, fazer logout e login novamente

### Passo 2: Tornar Functions Públicas (Teste)

1. Acessar console do Google Cloud
2. Tornar Functions públicas temporariamente
3. Testar se funciona
4. Se funcionar, o problema é de permissões

### Passo 3: Configurar Permissões Corretas

Se o teste funcionar, configurar permissões corretas:

1. Remover acesso público
2. Adicionar permissão para usuários autenticados
3. Verificar se o código das Functions valida autenticação

---

## Comandos Úteis

### Verificar Functions:
```bash
firebase functions:list
```

### Ver Logs:
```bash
firebase functions:log
```

### Redeploy:
```bash
firebase deploy --only functions
```

### Verificar Projeto:
```bash
firebase projects:list
```

---

## Checklist de Diagnóstico

- [ ] Usuário está logado no frontend?
- [ ] Token de autenticação está sendo enviado?
- [ ] Functions estão deployadas e ativas?
- [ ] Permissões IAM estão configuradas?
- [ ] Logs das Functions mostram algum erro?
- [ ] Firestore rules permitem acesso?

---

## Se Nada Funcionar

### Última Opção: Usar Firebase Hosting + Functions

Configurar rewrite no firebase.json para que o Hosting redirecione para Functions:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/api/sendEmailBroadcast",
        "function": "sendEmailBroadcast"
      },
      {
        "source": "/api/verifyEmail",
        "function": "verifyEmail"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Isso elimina problemas de CORS completamente.

---

## Resumo

**Problema:** Erro 403 mesmo no Blaze Plan
**Causa Mais Provável:** Permissões IAM ou autenticação
**Solução Rápida:** Tornar Functions públicas (teste)
**Solução Definitiva:** Configurar permissões IAM corretas

**Tempo estimado:** 10-15 minutos