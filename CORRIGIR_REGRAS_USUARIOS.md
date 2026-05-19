# 🔧 CORREÇÃO URGENTE: Regras do Firestore para Usuários

## ⚠️ PROBLEMA IDENTIFICADO

As regras atuais do Firestore **NÃO permitem** que o admin liste todos os usuários!

### Regra Problemática (ATUAL):
```javascript
allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
```

Esta regra funciona para ler **um usuário específico**, mas **NÃO funciona** para listar todos os usuários (query).

## ✅ SOLUÇÃO

Separar as permissões de leitura em duas:
- `allow get` - Para ler um documento específico
- `allow list` - Para listar múltiplos documentos (queries)

### Regras Corretas (NOVA):
```javascript
// Leitura individual: próprio usuário ou admin
allow get: if isAuthenticated() && (request.auth.uid == userId || isAdmin());

// Leitura de lista: apenas admin
allow list: if isAdmin();
```

## 📋 PASSO A PASSO PARA CORRIGIR

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: **gjterezinha**

### 2. Vá em Firestore Database > Regras
- No menu lateral, clique em **"Firestore Database"**
- Clique na aba **"Regras"** (Rules)

### 3. Certifique-se de Estar no Banco Correto
- **IMPORTANTE**: Verifique se está no banco **(default)**
- Se estiver em outro banco, mude para **(default)**

### 4. Cole as Regras Completas Abaixo

**COPIE E COLE TUDO:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================================================
    // FUNÇÕES AUXILIARES
    // ============================================================================
    
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
    
    // ============================================================================
    // REGRAS POR COLEÇÃO
    // ============================================================================
    
    // Coleção: users
    match /users/{userId} {
      // Leitura individual: próprio usuário ou admin
      allow get: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      
      // Leitura de lista: apenas admin
      allow list: if isAdmin();
      
      // Criação: próprio usuário (durante registro) ou admin
      allow create: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      
      // Atualização: admin pode tudo, usuário pode atualizar seus próprios dados de perfil
      allow update: if isAdmin() || 
                      (request.auth.uid == userId && 
                        request.resource.data.diff(resource.data).affectedKeys()
                          .hasOnly(['lastLogin', 'displayName', 'email', 'phone', 'birthDate', 'photoUrl']));
      
      // Deleção: apenas admin
      allow delete: if isAdmin();
    }
    
    // Coleção: members
    match /members/{memberId} {
      // Leitura: todos autenticados
      allow read: if isAuthenticated();
      
      // Escrita: apenas admin
      allow create, update, delete: if isAdmin();
    }
    
    // Coleção: events
    match /events/{eventId} {
      // Leitura: todos autenticados
      allow read: if isAuthenticated();
      
      // Criação e atualização: coordenadores e admins
      allow create, update: if isCoordinator();
      
      // Deleção: apenas admin
      allow delete: if isAdmin();
    }
    
    // Coleção: transactions
    match /transactions/{transactionId} {
      // Leitura: coordenadores e admins
      allow read: if isCoordinator();
      
      // Escrita: apenas admin
      allow create, update, delete: if isAdmin();
    }
    
    // Coleção: attendance (se existir no futuro)
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || isCoordinator());
      allow delete: if isCoordinator();
    }
    
    // Coleção: settings (se existir no futuro)
    match /settings/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

### 5. Publique as Regras
- Clique no botão **"Publicar"** (Publish)
- Aguarde a confirmação de sucesso

### 6. Teste Imediatamente
1. Faça logout do sistema
2. Faça login novamente como admin
3. Vá em `/users`
4. Agora você deve ver TODOS os usuários!

## 🎯 O Que Mudou?

### Antes (ERRADO):
```javascript
allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
```
- ❌ Não funciona para queries (listar todos)
- ✅ Funciona apenas para leitura individual

### Depois (CORRETO):
```javascript
allow get: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
allow list: if isAdmin();
```
- ✅ `get` - Leitura individual funciona
- ✅ `list` - Admin pode listar todos os usuários

## 📊 Diferença entre `read`, `get` e `list`

### `allow read`
- Equivalente a: `allow get, list`
- Permite tanto leitura individual quanto queries

### `allow get`
- Apenas leitura de **um documento específico**
- Exemplo: `db.collection('users').doc('userId').get()`

### `allow list`
- Apenas leitura de **múltiplos documentos** (queries)
- Exemplo: `db.collection('users').get()`
- Exemplo: `db.collection('users').where('role', '==', 'admin').get()`

## ✅ Como Verificar se Funcionou

### Teste 1: Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba Console
3. Não deve haver erros de permissão

### Teste 2: Página de Usuários
1. Faça login como admin
2. Vá em `/users`
3. Você deve ver TODOS os usuários cadastrados
4. O contador nas tabs deve mostrar o número correto

### Teste 3: Firestore Console
1. Firebase Console > Firestore Database
2. Banco: **(default)**
3. Collection: **users**
4. Compare o número de documentos com o contador na página

## 🔐 Segurança Mantida

Estas regras mantêm a segurança:
- ✅ Usuários comuns só podem ler seu próprio documento
- ✅ Apenas admin pode listar todos os usuários
- ✅ Usuários podem atualizar apenas seus próprios dados de perfil
- ✅ Apenas admin pode deletar usuários
- ✅ Usuários NÃO podem alterar seu próprio role

## ❓ Problemas Comuns

### "Ainda não vejo os usuários"
1. Certifique-se de publicar no banco **(default)**
2. Faça logout e login novamente
3. Limpe o cache: `localStorage.clear(); location.reload();`

### "Erro de permissão no console"
1. Verifique se as regras foram publicadas
2. Aguarde alguns segundos após publicar
3. Recarregue a página

### "Vejo alguns usuários mas não todos"
1. Verifique se todos os usuários estão no banco **(default)**
2. Verifique se não há filtros ativos na página

## 📞 Próximos Passos

1. **Publique as regras corrigidas AGORA**
2. **Teste a página de usuários**
3. **Se funcionar, crie o novo usuário novamente**
4. **Verifique se ele aparece na lista**

## 🎉 Depois de Corrigir

Após publicar as regras corretas:
- ✅ Admin verá todos os usuários
- ✅ Novos usuários aparecerão automaticamente
- ✅ Sistema funcionará perfeitamente