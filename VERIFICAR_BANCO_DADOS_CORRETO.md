# 🔍 Verificar Banco de Dados Correto no Firestore

## ⚠️ Problema Identificado:
Você pode ter **múltiplos bancos de dados** no Firestore e estar publicando as regras no banco errado!

## 🎯 Solução: Verificar e Corrigir

### Passo 1: Verificar qual banco o app está usando

1. **Abra o arquivo `.env` ou `.env.local`**
2. **Procure pela variável:**
   ```
   VITE_FIREBASE_PROJECT_ID=seu-projeto-id
   ```
3. **Anote o Project ID**

### Passo 2: Verificar no Firebase Console

1. **Acesse:** https://console.firebase.google.com
2. **Selecione seu projeto** (verifique se é o mesmo do Project ID)
3. **Firestore Database**
4. **Verifique o nome do banco** (geralmente é `(default)`)

### Passo 3: Verificar se há múltiplos bancos

No Firebase Console → Firestore Database:
- Procure por um **dropdown** ou **seletor de banco** no topo
- Se houver múltiplos bancos, você precisa selecionar o correto

### Passo 4: Publicar Regras no Banco Correto

1. **Selecione o banco correto** (geralmente `(default)`)
2. **Vá em Rules**
3. **Publique as regras do arquivo `firestore.rules`**

## 🔍 Como Saber Qual é o Banco Correto?

### Método 1: Verificar no Código

Abra `src/config/firebase.ts` e veja se há alguma configuração de database:

```typescript
const db = getFirestore(app);
// ou
const db = getFirestore(app, 'nome-do-banco');
```

Se não houver segundo parâmetro, está usando o banco `(default)`.

### Método 2: Testar no Console do Navegador

1. Acesse: https://gjsantaterezinha.vercel.app
2. Abra Console (F12)
3. Tente registrar um usuário
4. Procure pelo erro que deve mostrar o nome do banco

### Método 3: Verificar Collections Existentes

No Firebase Console → Firestore Database:
- Veja quais collections existem
- Se você vê `users`, `events`, `members` → é o banco correto
- Se está vazio ou tem outras collections → pode ser o banco errado

## ✅ Checklist de Verificação:

- [ ] Project ID no `.env` corresponde ao projeto no Firebase Console
- [ ] Banco de dados selecionado é o `(default)` (ou o correto)
- [ ] Regras publicadas no banco correto
- [ ] Collections `users`, `events`, `members` existem no banco
- [ ] Após registrar usuário, ele aparece na collection `users`

## 🆘 Se Ainda Não Funcionar:

### Opção 1: Criar Usuário Manualmente no Firestore

1. Firebase Console → Firestore Database
2. Selecione o banco correto
3. Collection `users` → Add document
4. Document ID: [copie o UID do Authentication]
5. Campos:
   ```
   id: (string) [mesmo UID]
   email: (string) "email@exemplo.com"
   displayName: (string) "Nome"
   role: (string) "member"
   createdAt: (timestamp) [agora]
   lastLogin: (timestamp) [agora]
   ```

### Opção 2: Verificar Logs Detalhados

No Console do navegador, após tentar registrar, procure por:
- `✅ Usuário criado no Firestore com sucesso`
- `❌ ERRO ao salvar usuário no Firestore`
- `⚠️ Firestore não está disponível`

O erro deve indicar o problema exato.

## 📸 Screenshots Úteis

Para me ajudar a diagnosticar, tire screenshots de:
1. Firebase Console → Firestore Database (mostrando o nome do banco)
2. Firebase Console → Firestore Database → Rules (mostrando as regras publicadas)
3. Console do navegador (F12) após tentar registrar usuário
4. Arquivo `.env` (pode ocultar valores sensíveis, mas mostre as variáveis)