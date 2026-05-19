# 🔍 Diagnóstico: Novo Usuário Não Aparece

## Problema
Você criou um novo usuário mas ele não aparece na página de Usuários para o admin.

## ✅ Checklist de Diagnóstico

### 1. Verificar em Qual Banco o Usuário Foi Criado

#### Passo 1: Acesse o Firebase Console
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: **gjterezinha**

#### Passo 2: Vá em Firestore Database
- No menu lateral, clique em **"Firestore Database"**

#### Passo 3: Verifique o Banco de Dados
- **IMPORTANTE**: No topo da página, você verá o nome do banco
- Você tem 2 bancos:
  - **"gjterezinha"** (vazio - NÃO USE ESTE)
  - **(default)** (com dados - USE ESTE)

#### Passo 4: Mude para o Banco Correto
- Se estiver em "gjterezinha", clique no dropdown e selecione **(default)**

#### Passo 5: Verifique a Collection "users"
- Clique na collection **"users"**
- Você deve ver TODOS os usuários cadastrados
- Procure pelo novo usuário que você criou

### 2. Verificar se o Documento Foi Criado

Se o usuário NÃO aparece na collection "users":

#### Possível Causa: Regras do Firestore Bloqueando
- As regras antigas bloqueavam a criação de documentos
- Você precisa publicar as novas regras

#### Solução:
1. Siga o guia: `PUBLICAR_REGRAS_AGORA.md`
2. Certifique-se de publicar no banco **(default)**
3. Tente criar o usuário novamente

### 3. Verificar se o Admin Consegue Ler

Se o usuário APARECE na collection "users" mas NÃO aparece na página:

#### Possível Causa: Regras de Leitura Bloqueando
- O admin pode não ter permissão para ler todos os usuários

#### Solução:
1. Vá em Firestore Database > Regras
2. Certifique-se de estar no banco **(default)**
3. Verifique se as regras permitem admin ler usuários:

```javascript
// Coleção: users
match /users/{userId} {
  // Leitura: próprio usuário ou admin
  allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  
  // Criação: próprio usuário (durante registro) ou admin
  allow create: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  
  // ... resto das regras
}
```

### 4. Verificar Console do Navegador

#### Passo 1: Abra o DevTools
- Pressione F12 ou Cmd+Option+I (Mac)

#### Passo 2: Vá na aba Console
- Procure por erros em vermelho
- Erros comuns:
  - `permission-denied` - Regras bloqueando
  - `not-found` - Banco errado

#### Passo 3: Vá na aba Network
- Recarregue a página
- Procure por requisições para Firestore
- Verifique se há erros 403 (permissão negada)

### 5. Forçar Atualização

#### No Console do Navegador:
```javascript
// Limpar cache do navegador
localStorage.clear();
sessionStorage.clear();

// Recarregar página
location.reload();
```

## 🎯 Solução Rápida

### Se o Usuário Não Foi Criado:

1. **Publique as Novas Regras**
   - Siga: `PUBLICAR_REGRAS_AGORA.md`
   - Banco: **(default)**

2. **Crie o Usuário Novamente**
   - Vá em: `/register`
   - Preencha todos os campos
   - Clique em "Cadastrar"

3. **Verifique no Firestore**
   - Banco: **(default)**
   - Collection: **users**
   - Deve aparecer o novo documento

### Se o Usuário Foi Criado Mas Não Aparece:

1. **Faça Logout e Login Novamente**
   - Clique no ícone de perfil
   - Clique em "Sair"
   - Faça login novamente como admin

2. **Limpe o Cache**
   - F12 > Console
   - Digite: `localStorage.clear(); location.reload();`

3. **Verifique as Regras**
   - Certifique-se de que admin pode ler todos os usuários

## 📊 Como Verificar se Está Funcionando

### Teste 1: Ver Usuários no Firestore
1. Firebase Console > Firestore Database
2. Banco: **(default)**
3. Collection: **users**
4. Você deve ver TODOS os usuários

### Teste 2: Ver Usuários na Página
1. Faça login como admin
2. Vá em: `/users`
3. Você deve ver TODOS os usuários na lista

### Teste 3: Contador de Usuários
1. Na página `/users`
2. Veja as tabs no topo
3. Deve mostrar: "Todos (X)" onde X é o número total de usuários

## 🔧 Comandos Úteis

### Verificar Regras Atuais (Firebase CLI):
```bash
cd gj-santa-terezinha
firebase firestore:rules:get
```

### Publicar Regras (Firebase CLI):
```bash
cd gj-santa-terezinha
firebase deploy --only firestore:rules
```

## ❓ Ainda Não Funciona?

### Informações para Debug:

1. **Quantos usuários aparecem no Firestore?**
   - Firebase Console > Firestore > users > Contar documentos

2. **Quantos usuários aparecem na página?**
   - Página /users > Ver contador nas tabs

3. **Há erros no console?**
   - F12 > Console > Copiar erros

4. **Qual banco está usando?**
   - Firebase Console > Firestore > Ver nome do banco no topo

5. **As regras foram publicadas?**
   - Firebase Console > Firestore > Regras > Ver última publicação

## 📞 Próximos Passos

1. Siga este checklist na ordem
2. Anote onde encontrou o problema
3. Se precisar de ajuda, informe:
   - Qual passo do checklist você está
   - O que você vê no Firestore
   - Erros no console (se houver)