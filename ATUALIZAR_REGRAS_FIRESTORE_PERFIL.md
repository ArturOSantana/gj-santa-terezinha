# 🔒 Atualizar Regras do Firestore - Perfil de Usuário

## ⚠️ IMPORTANTE
As regras do Firestore foram atualizadas para permitir que usuários editem seus próprios perfis. Você precisa publicar essas regras no Firebase Console.

## 📋 Passo a Passo

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: **gjterezinha**

### 2. Navegue até Firestore Database
- No menu lateral, clique em **"Firestore Database"**
- Clique na aba **"Regras"** (Rules)

### 3. Verifique o Banco de Dados Correto
- **IMPORTANTE**: Certifique-se de estar no banco **(default)**
- Se estiver em outro banco (como "gjterezinha"), mude para **(default)**

### 4. Copie as Novas Regras
As regras já estão no arquivo `firestore.rules` do projeto. Copie o conteúdo completo:

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
      // Leitura: próprio usuário ou admin
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      
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

### 5. Cole as Regras no Firebase Console
- Cole o conteúdo completo no editor de regras
- Clique em **"Publicar"** (Publish)

### 6. Confirme a Publicação
- Aguarde a mensagem de sucesso
- As regras estarão ativas imediatamente

## ✅ O Que Mudou?

### Antes:
```javascript
// Usuário só podia atualizar lastLogin
allow update: if isAdmin() || 
                (request.auth.uid == userId && 
                  request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastLogin']));
```

### Depois:
```javascript
// Usuário pode atualizar dados de perfil
allow update: if isAdmin() || 
                (request.auth.uid == userId && 
                  request.resource.data.diff(resource.data).affectedKeys()
                    .hasOnly(['lastLogin', 'displayName', 'email', 'phone', 'birthDate', 'photoUrl']));
```

## 🎯 Campos que Usuários Podem Atualizar

Agora os usuários podem atualizar seus próprios:
- ✅ **displayName** - Nome de exibição
- ✅ **email** - Email (com reautenticação)
- ✅ **phone** - Telefone
- ✅ **birthDate** - Data de nascimento
- ✅ **photoUrl** - Foto de perfil
- ✅ **lastLogin** - Último login (automático)

## 🔐 Segurança

- ✅ Usuários **NÃO** podem alterar seu próprio `role`
- ✅ Usuários **NÃO** podem alterar dados de outros usuários
- ✅ Apenas admins podem deletar usuários
- ✅ Apenas admins podem alterar roles

## 🧪 Como Testar

1. Faça login no sistema
2. Clique no ícone de perfil no canto superior direito
3. Clique em "Meu Perfil"
4. Tente editar seus dados
5. Clique em "Salvar"
6. Verifique se as alterações foram salvas

## ❓ Problemas?

Se encontrar erro de permissão:
1. Verifique se publicou as regras no banco **(default)**
2. Verifique se copiou as regras completas
3. Aguarde alguns segundos após publicar
4. Faça logout e login novamente

## 📞 Suporte

Se precisar de ajuda, entre em contato com o desenvolvedor.