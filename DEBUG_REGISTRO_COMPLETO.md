# 🔍 Debug Completo: Usuário Não Está Sendo Criado

## ⚠️ PROBLEMA
Você tentou criar um novo usuário mas ele **NÃO aparece**:
- ❌ Não está no Firestore Database
- ❌ Não aparece na página de Usuários
- ✅ Regras foram publicadas

## 📋 PASSO A PASSO PARA DIAGNOSTICAR

### 1. Abra o Console do Navegador

#### No Chrome/Edge:
- Pressione **F12** ou **Cmd+Option+I** (Mac)
- Clique na aba **"Console"**

#### No Firefox:
- Pressione **F12** ou **Cmd+Option+K** (Mac)
- Clique na aba **"Console"**

### 2. Limpe o Console
- Clique no ícone 🚫 para limpar mensagens antigas

### 3. Tente Criar o Usuário Novamente

1. Vá em: `http://localhost:5173/register` (ou seu site)
2. Preencha TODOS os campos:
   - Nome: `Teste Usuario`
   - Email: `teste@teste.com`
   - Telefone: `(11) 99999-9999`
   - Data de Nascimento: `01/01/2000`
   - Senha: `123456`
   - Confirmar Senha: `123456`
3. Clique em **"Cadastrar"**

### 4. Observe o Console

Procure por mensagens que começam com:
- ✅ `✅ Usuário criado no Firestore com sucesso:`
- ❌ `❌ ERRO ao salvar usuário no Firestore:`
- ⚠️ `⚠️ Firestore não está disponível`

## 🎯 POSSÍVEIS ERROS E SOLUÇÕES

### Erro 1: `permission-denied`
```
❌ ERRO ao salvar usuário no Firestore:
FirebaseError: Missing or insufficient permissions
code: "permission-denied"
```

**Causa**: As regras do Firestore estão bloqueando a criação.

**Solução**:
1. Verifique se publicou as regras no banco **(default)**
2. Verifique se a regra de `create` está correta:
```javascript
allow create: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
```

### Erro 2: `invalid-argument`
```
❌ ERRO ao salvar usuário no Firestore:
FirebaseError: Invalid data
code: "invalid-argument"
```

**Causa**: Algum campo está com tipo errado (ex: birthDate como string em vez de Date).

**Solução**: Verificar se o campo `birthDate` está sendo convertido corretamente.

### Erro 3: `not-found`
```
❌ ERRO ao salvar usuário no Firestore:
FirebaseError: Database not found
code: "not-found"
```

**Causa**: Tentando salvar no banco errado.

**Solução**: Verificar configuração do Firebase.

### Erro 4: Nenhum erro aparece
```
(Nenhuma mensagem de erro ou sucesso)
```

**Causa**: O código pode estar falhando silenciosamente.

**Solução**: Verificar se o Firebase está configurado corretamente.

## 🔧 VERIFICAÇÕES ADICIONAIS

### Verificação 1: Firebase Authentication

1. Acesse: https://console.firebase.google.com
2. Vá em **Authentication** > **Users**
3. Procure pelo email que você tentou cadastrar
4. **Se o usuário APARECE aqui**: O problema é só no Firestore
5. **Se o usuário NÃO APARECE**: O problema é no Authentication

### Verificação 2: Firestore Database

1. Acesse: https://console.firebase.google.com
2. Vá em **Firestore Database**
3. Certifique-se de estar no banco **(default)**
4. Clique na collection **"users"**
5. Procure pelo UID do usuário

### Verificação 3: Regras do Firestore

1. Acesse: https://console.firebase.google.com
2. Vá em **Firestore Database** > **Regras**
3. Certifique-se de estar no banco **(default)**
4. Verifique se a regra de `create` está assim:

```javascript
match /users/{userId} {
  // Leitura individual: próprio usuário ou admin
  allow get: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  
  // Leitura de lista: apenas admin
  allow list: if isAdmin();
  
  // Criação: próprio usuário (durante registro) ou admin
  allow create: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
  
  // ... resto das regras
}
```

## 📊 TESTE MANUAL NO CONSOLE

Cole este código no Console do navegador (após tentar criar o usuário):

```javascript
// Verificar se Firebase está configurado
console.log('Firebase Auth:', firebase.auth());
console.log('Firebase Firestore:', firebase.firestore());

// Verificar usuário atual
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ Usuário autenticado:', user.uid, user.email);
    
    // Tentar ler o documento do usuário
    firebase.firestore().collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          console.log('✅ Documento existe no Firestore:', doc.data());
        } else {
          console.log('❌ Documento NÃO existe no Firestore');
        }
      })
      .catch((error) => {
        console.error('❌ Erro ao ler documento:', error);
      });
  } else {
    console.log('❌ Nenhum usuário autenticado');
  }
});
```

## 🎯 CENÁRIOS COMUNS

### Cenário 1: Usuário Criado no Auth mas NÃO no Firestore

**Sintomas**:
- ✅ Aparece em Authentication > Users
- ❌ NÃO aparece em Firestore > users

**Causa**: Regras do Firestore bloqueando `create`

**Solução**:
1. Verifique as regras do Firestore
2. Certifique-se de que `allow create` está correto
3. Publique as regras novamente

### Cenário 2: Erro de Validação

**Sintomas**:
- ❌ Mensagem de erro no formulário
- ❌ Usuário não é criado

**Causa**: Validação de telefone ou data falhando

**Solução**:
1. Verifique o formato do telefone: `(11) 99999-9999`
2. Verifique a data de nascimento: idade mínima 12 anos
3. Verifique se todos os campos estão preenchidos

### Cenário 3: Firebase Não Configurado

**Sintomas**:
- ⚠️ Aviso de Firebase não configurado
- ❌ Nada funciona

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verifique o arquivo `.env`
2. Certifique-se de que todas as variáveis estão preenchidas
3. Reinicie o servidor de desenvolvimento

## 📞 INFORMAÇÕES PARA REPORTAR

Se o problema persistir, me informe:

1. **Mensagens do Console**:
   - Copie TODAS as mensagens (erros e avisos)
   - Inclua mensagens em vermelho e amarelo

2. **Firebase Authentication**:
   - O usuário aparece em Authentication > Users?
   - Qual é o UID do usuário?

3. **Firestore Database**:
   - Qual banco está usando? (default ou gjterezinha)
   - Quantos documentos tem na collection "users"?

4. **Regras do Firestore**:
   - Copie a regra completa da collection "users"
   - Quando foi a última publicação?

5. **Dados do Formulário**:
   - Qual email você tentou cadastrar?
   - Qual telefone?
   - Qual data de nascimento?

## 🚀 TESTE RÁPIDO

Execute este teste para confirmar se o problema é de permissão:

1. Abra o Console do navegador
2. Cole este código:

```javascript
// Teste de permissão de escrita
const testUser = {
  id: 'test-123',
  email: 'test@test.com',
  displayName: 'Test User',
  phone: '(11) 99999-9999',
  birthDate: new Date('2000-01-01'),
  role: 'member',
  createdAt: new Date(),
  lastLogin: new Date()
};

firebase.firestore().collection('users').doc('test-123').set(testUser)
  .then(() => {
    console.log('✅ SUCESSO: Permissão de escrita OK!');
    // Limpar teste
    firebase.firestore().collection('users').doc('test-123').delete();
  })
  .catch((error) => {
    console.error('❌ ERRO: Permissão negada!', error);
  });
```

Se aparecer `✅ SUCESSO`, as regras estão OK.
Se aparecer `❌ ERRO`, as regras estão bloqueando.