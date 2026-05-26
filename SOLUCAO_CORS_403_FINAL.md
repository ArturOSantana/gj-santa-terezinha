# Solução Definitiva - CORS 403

## Problema

Erro 403 (Forbidden) ao chamar Firebase Functions em produção, mesmo após especificar região us-central1.

```
CORS header 'Access-Control-Allow-Origin' missing. Status code: 403
```

## Causa Raiz

O erro 403 NÃO é um problema de CORS, mas sim de **permissões IAM**. As Functions estão bloqueando chamadas não autorizadas.

## Solução Completa

### PASSO 1: Verificar se Functions são Públicas ou Privadas

As Functions `onCall` do Firebase são **privadas por padrão** e requerem autenticação.

**Verificar no código:**
```typescript
// functions/src/index.ts
export const sendEmailBroadcast = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }
  // ...
});
```

Isso significa que o usuário DEVE estar autenticado no frontend.

### PASSO 2: Verificar Autenticação no Frontend

O problema pode ser que o token de autenticação não está sendo enviado corretamente.

**Verificar em produção:**
1. Abrir DevTools (F12)
2. Ir para aba "Application" → "Local Storage"
3. Verificar se há chaves do Firebase Auth
4. Ir para aba "Console"
5. Executar:
```javascript
firebase.auth().currentUser
```

Se retornar `null`, o usuário não está autenticado!

### PASSO 3: Tornar Functions Públicas (Temporariamente para Teste)

Para testar se o problema é autenticação, podemos tornar as Functions públicas:

```bash
# Tornar Function pública
gcloud functions add-iam-policy-binding sendEmailBroadcast \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=gj-santaterezinha

# Repetir para cada Function
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
```

**ATENÇÃO:** Isso torna as Functions públicas! Use apenas para teste.

### PASSO 4: Verificar Configuração do Firebase no Frontend

O problema mais provável é que o frontend em produção não tem as variáveis de ambiente corretas.

**Verificar no Vercel:**
1. Acessar: https://vercel.com/seu-usuario/gj-santa-terezinha/settings/environment-variables
2. Verificar se TODAS as variáveis estão configuradas:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=gj-santaterezinha.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gj-santaterezinha
VITE_FIREBASE_STORAGE_BUCKET=gj-santaterezinha.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=627...
VITE_FIREBASE_APP_ID=1:627...
```

3. Se faltarem, adicionar e fazer **Redeploy**

### PASSO 5: Solução Definitiva - Usar Firebase Hosting

O problema pode ser que o Vercel não está enviando os headers corretos. A solução é usar Firebase Hosting:

```bash
# Deploy para Firebase Hosting
firebase deploy --only hosting

# Isso vai hospedar em:
# https://gj-santaterezinha.web.app
# ou
# https://gj-santaterezinha.firebaseapp.com
```

Firebase Hosting tem integração nativa com Functions e não tem problemas de CORS.

### PASSO 6: Alternativa - Usar onRequest com CORS

Se nada funcionar, mudar de `onCall` para `onRequest` com CORS manual:

```typescript
// functions/src/index.ts
import * as cors from 'cors';

const corsHandler = cors({ 
  origin: [
    'https://gjsantaterezinha.vercel.app',
    'https://gj-santaterezinha.web.app',
    'http://localhost:5173'
  ],
  credentials: true 
});

export const sendEmailBroadcast = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Verificar autenticação manualmente
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      if (!idToken) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Lógica da Function
      // ...
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
```

**Nota:** Isso requer mudar o frontend também para enviar o token manualmente.

## Comandos Rápidos

### Verificar IAM Permissions
```bash
gcloud functions get-iam-policy sendEmailBroadcast \
  --region=us-central1 \
  --project=gj-santaterezinha
```

### Tornar Function Pública (Teste)
```bash
gcloud functions add-iam-policy-binding sendEmailBroadcast \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=gj-santaterezinha
```

### Remover Acesso Público (Depois do Teste)
```bash
gcloud functions remove-iam-policy-binding sendEmailBroadcast \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker \
  --project=gj-santaterezinha
```

### Deploy para Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Checklist de Diagnóstico

- [ ] Usuário está autenticado no frontend?
- [ ] Token de autenticação está sendo enviado?
- [ ] Variáveis de ambiente configuradas no Vercel?
- [ ] Functions estão deployadas em us-central1?
- [ ] IAM permissions estão corretas?
- [ ] Firestore rules permitem acesso?

## Solução Recomendada

**Opção 1: Firebase Hosting (Melhor)**
- Deploy no Firebase Hosting
- Integração nativa com Functions
- Sem problemas de CORS
- Domínio: gj-santaterezinha.web.app

**Opção 2: Corrigir Vercel**
- Adicionar todas as variáveis de ambiente
- Verificar autenticação
- Pode precisar configurar headers no vercel.json

**Opção 3: Tornar Functions Públicas**
- Apenas para teste
- NÃO recomendado para produção
- Qualquer um pode chamar as Functions

## Próximos Passos

1. **Testar localmente primeiro:**
```bash
npm run dev
# Testar se funciona localmente
```

2. **Se funcionar localmente, o problema é no Vercel:**
   - Adicionar variáveis de ambiente
   - Ou migrar para Firebase Hosting

3. **Se não funcionar localmente:**
   - Problema no código
   - Verificar autenticação

4. **Deploy final:**
```bash
# Opção A: Firebase Hosting
npm run build
firebase deploy --only hosting

# Opção B: Vercel (após corrigir variáveis)
git add .
git commit -m "fix: corrigir autenticação"
git push origin main
```

## Contato

Se o problema persistir, verificar:
- Console do Firebase: https://console.firebase.google.com
- Logs das Functions: `firebase functions:log`
- Status do Firebase: https://status.firebase.google.com