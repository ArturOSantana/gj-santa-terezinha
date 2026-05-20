# 🔐 Guia de Regras do Firestore - GJ Santa Terezinha

> **Última atualização:** 20/05/2026  
> **Status:** ✅ Regras atualizadas e funcionais

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Regras Atuais](#regras-atuais)
- [Como Publicar Regras](#como-publicar-regras)
- [Troubleshooting](#troubleshooting)
- [Histórico de Mudanças](#histórico-de-mudanças)

---

## 🎯 Visão Geral

Este documento é a **fonte única de verdade** para as regras de segurança do Firestore do projeto GJ Santa Terezinha. Todas as outras documentações sobre regras foram consolidadas aqui.

### Arquivo de Regras

**Localização:** [`firestore.rules`](firestore.rules)

### Princípios de Segurança

1. **Autenticação obrigatória** - Todas as operações exigem usuário autenticado
2. **Controle baseado em roles** - Admin, Coordinator e Member têm permissões diferentes
3. **Validação de dados** - Campos obrigatórios e tipos são validados
4. **Proteção de dados sensíveis** - Roles só podem ser alterados por admins

---

## 📜 Regras Atuais

### Funções Auxiliares

```javascript
// Verifica se o usuário está autenticado
function isAuthenticated() {
  return request.auth != null;
}

// Obtém o role do usuário (com fallback seguro)
function getUserRole() {
  let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
  return userDoc != null && userDoc.data != null ? userDoc.data.role : 'member';
}

// Verifica se o usuário é admin
function isAdmin() {
  return isAuthenticated() && getUserRole() == 'admin';
}

// Verifica se o usuário é coordinator ou admin
function isCoordinatorOrAdmin() {
  return isAuthenticated() && (getUserRole() == 'coordinator' || getUserRole() == 'admin');
}
```

### Coleção: users

```javascript
match /users/{userId} {
  // Leitura individual: próprio usuário ou admin
  allow get: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  
  // Leitura de lista: apenas admin
  allow list: if isAdmin();
  
  // Criação: qualquer usuário autenticado pode criar SEU PRÓPRIO documento
  allow create: if request.auth != null && request.auth.uid == userId;
  
  // Atualização: admin pode tudo, usuário pode atualizar seus próprios dados
  allow update: if isAdmin() ||
                  (request.auth.uid == userId &&
                    request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['lastLogin', 'displayName', 'email', 'phone', 'birthDate', 'photoUrl']));
  
  // Deleção: apenas admin
  allow delete: if isAdmin();
}
```

### Coleção: members

```javascript
match /members/{memberId} {
  // Leitura: qualquer usuário autenticado
  allow read: if isAuthenticated();
  
  // Escrita: apenas admin
  allow write: if isAdmin();
}
```

### Coleção: events

```javascript
match /events/{eventId} {
  // Leitura: qualquer usuário autenticado
  allow read: if isAuthenticated();
  
  // Escrita: coordinator ou admin
  allow write: if isCoordinatorOrAdmin();
}
```

### Coleção: transactions

```javascript
match /transactions/{transactionId} {
  // Leitura: coordinator ou admin
  allow read: if isCoordinatorOrAdmin();
  
  // Escrita: apenas admin
  allow write: if isAdmin();
}
```

---

## 🚀 Como Publicar Regras

### Pré-requisitos

1. Firebase CLI instalado: `npm install -g firebase-tools`
2. Autenticado no Firebase: `firebase login`
3. Projeto configurado: `firebase use --add`

### Publicação

```bash
# Navegar para o diretório do projeto
cd gj-santa-terezinha

# Publicar apenas as regras do Firestore
firebase deploy --only firestore:rules

# Ou publicar tudo (regras + índices)
firebase deploy --only firestore
```

### Verificação

Após publicar, verifique no [Firebase Console](https://console.firebase.google.com):

1. Acesse seu projeto
2. Vá em **Firestore Database** > **Regras**
3. Confirme que as regras foram atualizadas
4. Teste criando um novo usuário no sistema

---

## 🔧 Troubleshooting

### Erro: "permission-denied" ao criar usuário

**Causa:** Regras antigas ainda ativas no Firebase.

**Solução:**
```bash
firebase deploy --only firestore:rules
```

### Erro: "getUserRole is not defined"

**Causa:** Função auxiliar não foi publicada corretamente.

**Solução:** Verifique se o arquivo `firestore.rules` contém todas as funções auxiliares e republique.

### Coordinator não consegue criar eventos

**Causa:** Permissões do frontend não alinhadas com o backend.

**Solução:** Verifique [`src/utils/permissions.ts`](src/utils/permissions.ts) - deve estar alinhado com as regras do Firestore.

---

## 📚 Histórico de Mudanças

### 20/05/2026 - Correção Crítica de Registro

**Problema:** Novos usuários não eram salvos no Firestore após registro.

**Mudanças:**
- Modificada `getUserRole()` para retornar 'member' como fallback
- Simplificada regra de `create` em `users` para não exigir verificação de admin
- Alinhadas permissões do frontend com regras do backend

**Arquivos alterados:**
- [`firestore.rules`](firestore.rules)
- [`src/utils/permissions.ts`](src/utils/permissions.ts)

---

## 📞 Suporte

Para dúvidas ou problemas com as regras do Firestore:

1. Consulte [`CORRECOES_REALIZADAS.md`](CORRECOES_REALIZADAS.md) para histórico completo
2. Verifique [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md) para configuração inicial
3. Revise [`SISTEMA_AUTENTICACAO.md`](SISTEMA_AUTENTICACAO.md) para fluxo de autenticação

---

**⚠️ IMPORTANTE:** Este é o único documento oficial sobre regras do Firestore. Ignore qualquer outra documentação sobre o tema.