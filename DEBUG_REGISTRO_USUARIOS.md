# 🔍 Debug: Problema com Registro de Usuários

## Problema Identificado
Usuários conseguem se registrar no Firebase Authentication, mas não aparecem na página "Usuários" do sistema.

## Causa Provável
O usuário está sendo criado no **Firebase Authentication**, mas **NÃO está sendo salvo no Firestore** (collection `users`).

## Como Diagnosticar

### Passo 1: Verificar Console do Navegador
1. Acesse: https://gjsantaterezinha.vercel.app
2. Abra o Console do Navegador (F12 → Console)
3. Tente registrar um novo usuário
4. Procure por uma destas mensagens:

**✅ Sucesso:**
```
✅ Usuário criado no Firestore com sucesso: [user-id]
```

**❌ Erro:**
```
❌ ERRO ao salvar usuário no Firestore: [detalhes do erro]
Detalhes do erro: { code: "...", message: "...", ... }
```

**⚠️ Firestore Indisponível:**
```
⚠️ Firestore não está disponível. Usuário criado apenas no Authentication.
```

### Passo 2: Verificar Firebase Console

#### 2.1 Authentication
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Verifique se o novo usuário aparece aqui

#### 2.2 Firestore
1. No mesmo projeto, vá em **Firestore Database**
2. Procure pela collection **`users`**
3. Verifique se existe um documento com o mesmo ID do usuário do Authentication

### Passo 3: Verificar Regras do Firestore

As regras do Firestore podem estar bloqueando a criação de usuários. Verifique:

1. Firebase Console → **Firestore Database** → **Rules**
2. As regras devem permitir que usuários autenticados criem seu próprio documento:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir que usuários autenticados criem seu próprio documento
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'coordinator'];
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Outras collections...
  }
}
```

## Soluções Possíveis

### Solução 1: Corrigir Regras do Firestore
Se as regras estiverem bloqueando, atualize conforme o exemplo acima.

### Solução 2: Criar Usuário Manualmente no Firestore
Se o usuário já existe no Authentication mas não no Firestore:

1. Firebase Console → **Firestore Database**
2. Clique em **Start collection**
3. Collection ID: `users`
4. Document ID: [copie o UID do usuário do Authentication]
5. Adicione os campos:
   - `id` (string): [mesmo UID]
   - `email` (string): [email do usuário]
   - `displayName` (string): [nome do usuário]
   - `role` (string): `member`
   - `createdAt` (timestamp): [data atual]
   - `lastLogin` (timestamp): [data atual]

### Solução 3: Usar Script de Sincronização
Execute o script `promote-first-admin.js` que também pode ser adaptado para sincronizar usuários:

```bash
cd gj-santa-terezinha
node promote-first-admin.js
```

## Verificação Final

Após aplicar a solução:

1. Faça logout do sistema
2. Faça login com o usuário admin
3. Acesse a página **Usuários**
4. O novo usuário deve aparecer na lista
5. Você pode promovê-lo clicando no botão de editar role

## Logs Úteis

Os logs agora incluem informações detalhadas:
- ✅ Sucesso ao criar no Firestore
- ❌ Erro com código e mensagem
- ⚠️ Firestore indisponível

## Precisa de Ajuda?

Se o problema persistir, compartilhe:
1. Mensagens do console do navegador
2. Screenshot das regras do Firestore
3. Screenshot da collection `users` no Firestore