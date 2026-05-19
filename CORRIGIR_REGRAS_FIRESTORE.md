# 🔧 Corrigir Regras do Firestore

## ❌ Problema Identificado
```
Firestore não disponível: Missing or insufficient permissions.
```

Isso significa que as **regras do Firestore** estão bloqueando usuários de criar seus próprios documentos na collection `users`.

## ✅ Solução: Atualizar Regras do Firestore

### Passo 1: Acessar Firebase Console
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Rules** (Regras)

### Passo 2: Substituir as Regras

**IMPORTANTE:** Copie e cole as regras do arquivo `firestore.rules` ou use as regras abaixo, substituindo COMPLETAMENTE as regras atuais:

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
    match /users/{userId} {
      // Qualquer usuário autenticado pode ler QUALQUER documento de usuário
      allow read: if isAuthenticated();
      
      // Apenas o próprio usuário pode criar seu documento
      allow create: if isAuthenticated() && isOwner(userId);
      
      // Apenas o próprio usuário OU admin pode atualizar
      allow update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      
      // Apenas admin pode deletar
      allow delete: if isAdmin();
    }
    
    // Coleção: members
    match /members/{memberId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isCoordinator();
    }
    
    // Coleção: events
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isCoordinator();
    }
    
    // Coleção: transactions
    match /transactions/{transactionId} {
      allow read, write: if isCoordinator();
    }
    
    // Coleção: attendance
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isCoordinator());
      allow delete: if isCoordinator();
    }
    
    // Coleção: settings
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### Passo 3: Publicar as Regras
1. Após colar as regras acima, clique no botão **Publish** (Publicar)
2. Aguarde a confirmação de que as regras foram publicadas

### Passo 4: Testar Novamente
1. Acesse: https://gjsantaterezinha.vercel.app
2. Tente registrar um novo usuário
3. Agora deve funcionar! ✅

## 🔍 O que Mudou?

As principais mudanças nas regras:

### 1. Linha mais importante:
```javascript
allow create: if isAuthenticated() && isOwner(userId);
```
Permite que usuários autenticados criem seu próprio documento durante o registro.

### 2. Leitura de usuários:
```javascript
allow read: if isAuthenticated();
```
Permite que qualquer usuário autenticado leia documentos de usuários (necessário para verificar roles).

### 3. Members collection:
```javascript
allow read: if isAuthenticated();
allow create, update, delete: if isCoordinator();
```
Todos podem ler membros, mas apenas coordenadores e admins podem modificar.

## ⚠️ Segurança

Essas regras são seguras porque:
- ✅ Usuários só podem criar/modificar seu próprio documento
- ✅ Apenas admins podem modificar roles de outros usuários
- ✅ Todas as operações requerem autenticação
- ✅ Coordenadores e admins têm acesso adequado às collections

## 📝 Após Corrigir

Depois de publicar as novas regras:
1. Registre um novo usuário
2. Faça login com o admin
3. Acesse a página "Usuários"
4. O novo usuário deve aparecer na lista
5. Você pode promovê-lo clicando no ícone de editar

## ❓ Ainda com Problemas?

Se ainda aparecer erro de permissões:
1. Verifique se as regras foram publicadas corretamente
2. Aguarde 1-2 minutos (pode haver delay na propagação)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Tente novamente

## 📁 Arquivo de Referência

As regras corretas também estão salvas no arquivo: `firestore.rules`

Você pode copiar diretamente desse arquivo para o Firebase Console.