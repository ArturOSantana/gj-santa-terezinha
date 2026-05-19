# 🚨 URGENTE: Publicar Regras do Firestore

## ❌ Problema Atual:
Quando você registra um usuário:
- ✅ Ele é criado no **Firebase Authentication** (você consegue fazer login)
- ❌ Ele NÃO é salvo no **Firestore** (collection `users`)
- ❌ Por isso não aparece na página "Usuários"

**Causa:** As regras do Firestore estão bloqueando a criação de documentos na collection `users`.

## ✅ Solução: Publicar Novas Regras

### Passo 1: Copiar as Regras

Abra o arquivo `firestore.rules` na raiz do projeto e copie TODO o conteúdo.

Ou copie daqui:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isCoordinator() {
      return isAuthenticated() && getUserRole() in ['admin', 'coordinator'];
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow update: if isAdmin() || 
                       (request.auth.uid == userId && 
                        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastLogin']));
      allow delete: if isAdmin();
    }
    
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update: if isCoordinator();
      allow delete: if isAdmin();
    }
    
    match /transactions/{transactionId} {
      allow read: if isCoordinator();
      allow create, update, delete: if isAdmin();
    }
    
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isCoordinator());
      allow delete: if isCoordinator();
    }
    
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### Passo 2: Acessar Firebase Console

1. Abra: https://console.firebase.google.com
2. Clique no seu projeto
3. No menu lateral esquerdo, clique em **"Firestore Database"**
4. Clique na aba **"Rules"** (Regras) no topo

### Passo 3: Colar as Novas Regras

1. **Selecione TUDO** que está no editor de regras
2. **Delete** (Ctrl+A, Delete)
3. **Cole** as novas regras que você copiou
4. Clique no botão **"Publish"** (Publicar)

### Passo 4: Aguardar Confirmação

- Aguarde a mensagem de confirmação
- Pode levar alguns segundos

### Passo 5: Testar

1. Acesse: https://gjsantaterezinha.vercel.app
2. Tente registrar um novo usuário
3. Abra o Console do navegador (F12)
4. Procure pela mensagem: `✅ Usuário criado no Firestore com sucesso`

## 🔍 Verificar se Funcionou

### No Firebase Console:

1. Firestore Database
2. Procure pela collection **`users`**
3. Deve ter documentos com os IDs dos usuários

### No Sistema:

1. Faça login como admin
2. Acesse "Usuários"
3. Todos os usuários devem aparecer

## ⚠️ Linha Mais Importante

Esta linha permite que usuários criem seu próprio documento durante o registro:

```javascript
allow create: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
```

**Antes:** Essa permissão não existia, por isso dava erro.
**Depois:** Usuários podem criar seu documento, mas só o próprio ou admin.

## 🆘 Ainda com Erro?

Se após publicar as regras ainda der erro:

1. **Aguarde 1-2 minutos** (pode haver delay)
2. **Limpe o cache** do navegador (Ctrl+Shift+Delete)
3. **Tente registrar novamente**
4. **Verifique o Console** do navegador (F12) para ver o erro exato

## 📸 Screenshots Úteis

Se precisar de ajuda, tire screenshots de:
1. As regras publicadas no Firebase Console
2. O erro no Console do navegador (F12)
3. A collection `users` no Firestore (se existir)