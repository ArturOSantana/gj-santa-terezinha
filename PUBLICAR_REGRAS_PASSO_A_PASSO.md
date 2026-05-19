# 🚨 URGENTE: Publicar Regras do Firestore - Passo a Passo Visual

## ⚠️ ERRO ATUAL
```
Firestore não disponível: Missing or insufficient permissions
```

Isso significa que as regras do Firestore estão bloqueando TUDO, inclusive o teste de disponibilidade.

## 📋 PASSO A PASSO (SIGA EXATAMENTE)

### Passo 1: Acesse o Firebase Console
1. Abra: https://console.firebase.google.com
2. Faça login com sua conta Google
3. Clique no projeto **"gjterezinha"**

### Passo 2: Vá em Firestore Database
1. No menu lateral ESQUERDO, procure por **"Firestore Database"**
2. Clique em **"Firestore Database"**
3. Você verá a lista de collections (users, events, etc.)

### Passo 3: IMPORTANTE - Verifique o Banco de Dados
1. **NO TOPO DA PÁGINA**, você verá o nome do banco
2. Pode estar escrito:
   - **(default)** ← USE ESTE!
   - **gjterezinha** ← NÃO USE ESTE!

3. **SE estiver em "gjterezinha"**:
   - Clique no dropdown do nome do banco
   - Selecione **(default)**

### Passo 4: Vá na Aba "Regras"
1. No topo da página, você verá várias abas:
   - Dados
   - **Regras** ← CLIQUE AQUI
   - Índices
   - Uso

2. Clique na aba **"Regras"**

### Passo 5: Verifique o Banco NOVAMENTE
1. **IMPORTANTE**: Na aba Regras, verifique NOVAMENTE o nome do banco no topo
2. Deve estar em **(default)**
3. Se não estiver, mude para **(default)**

### Passo 6: Delete as Regras Antigas
1. No editor de regras, você verá o código atual
2. Selecione TUDO (Ctrl+A ou Cmd+A)
3. Delete TUDO

### Passo 7: Cole as Regras Novas
Cole EXATAMENTE este código:

```
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
      allow get: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow list: if isAdmin();
      allow create: if (request.auth != null && request.auth.uid == userId) || (isAuthenticated() && isAdmin());
      allow update: if isAdmin() || (request.auth.uid == userId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastLogin', 'displayName', 'email', 'phone', 'birthDate', 'photoUrl']));
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
      allow update: if isAuthenticated() && (resource.data.userId == request.auth.uid || isCoordinator());
      allow delete: if isCoordinator();
    }
    
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### Passo 8: Publique as Regras
1. Clique no botão **"Publicar"** (Publish) no canto superior direito
2. Aguarde a mensagem de confirmação
3. Deve aparecer: "Regras publicadas com sucesso"

### Passo 9: Aguarde 10 Segundos
1. Conte até 10 lentamente
2. As regras levam alguns segundos para propagar

### Passo 10: Teste Imediatamente
1. Volte para o sistema (localhost:5173)
2. Recarregue a página (Ctrl+R ou Cmd+R)
3. Vá em /register
4. Tente criar um novo usuário

## ✅ COMO SABER SE FUNCIONOU?

### No Console do Navegador (F12):
```
✅ Usuário criado no Firestore com sucesso: [UID]
```

### No Firestore:
1. Firebase Console > Firestore Database
2. Banco: (default)
3. Collection: users
4. Novo documento aparece!

## ❌ SE AINDA DER ERRO

### Erro: "Firestore não disponível"
**Causa**: Você publicou no banco errado

**Solução**:
1. Volte para Firebase Console
2. Firestore Database > Regras
3. Verifique o nome do banco NO TOPO
4. Deve ser **(default)**
5. Se não for, mude e publique novamente

### Erro: "Missing or insufficient permissions"
**Causa**: As regras não foram publicadas corretamente

**Solução**:
1. Copie as regras novamente
2. Cole no editor
3. Clique em "Publicar"
4. Aguarde 10 segundos
5. Recarregue o sistema

## 🎯 CHECKLIST FINAL

Antes de testar, confirme:
- [ ] Acessei Firebase Console
- [ ] Fui em Firestore Database
- [ ] Mudei para o banco **(default)**
- [ ] Fui na aba "Regras"
- [ ] Verifiquei que estou no banco **(default)**
- [ ] Deletei as regras antigas
- [ ] Colei as regras novas
- [ ] Cliquei em "Publicar"
- [ ] Aguardei 10 segundos
- [ ] Recarreguei o sistema

## 📞 INFORMAÇÕES PARA DEBUG

Se ainda não funcionar, me informe:

1. **Qual banco você está usando?**
   - (default) ou gjterezinha?

2. **As regras foram publicadas?**
   - Apareceu mensagem de sucesso?

3. **Quanto tempo aguardou?**
   - Aguardou pelo menos 10 segundos?

4. **Erro no console?**
   - Copie a mensagem completa

## 🚀 DEPOIS DE PUBLICAR

1. Recarregue o sistema
2. Vá em /register
3. Crie um usuário de teste
4. Verifique se aparece no Firestore
5. Faça login como admin
6. Verifique se aparece em /users

## ⚡ ATALHO RÁPIDO

Se você tem Firebase CLI instalado:

```bash
cd gj-santa-terezinha
firebase deploy --only firestore:rules --project gjterezinha
```

Isso publica as regras do arquivo `firestore.rules` automaticamente!