# 🚨 PUBLICAR REGRAS NO FIREBASE - FAÇA AGORA

## ⚡ Ação Rápida (5 minutos):

### 1️⃣ Copiar as Regras
Abra o arquivo `firestore.rules` e copie TODO o conteúdo (Ctrl+A, Ctrl+C)

### 2️⃣ Acessar Firebase Console
- Abra: https://console.firebase.google.com
- Clique no seu projeto
- Menu lateral: **Firestore Database**
- Aba superior: **Rules**

### 3️⃣ Colar e Publicar
- Selecione tudo no editor (Ctrl+A)
- Delete (Delete)
- Cole as novas regras (Ctrl+V)
- Clique em **"Publish"** (botão azul no canto superior direito)

### 4️⃣ Testar
- Acesse: https://gjsantaterezinha.vercel.app
- Registre um novo usuário
- Deve funcionar! ✅

## ✅ Como Saber se Funcionou:

### No Console do Navegador (F12):
Deve aparecer:
```
✅ Usuário criado no Firestore com sucesso: [user-id]
```

### No Firebase Console:
- Firestore Database
- Collection `users`
- Deve ter documentos com os IDs dos usuários

### No Sistema:
- Login como admin
- Página "Usuários"
- Todos os usuários devem aparecer

## ❌ Se Ainda Não Funcionar:

1. **Aguarde 1-2 minutos** após publicar
2. **Limpe o cache** do navegador (Ctrl+Shift+Delete)
3. **Tente novamente**
4. **Verifique** se as regras foram realmente publicadas no Firebase Console

## 🔍 Verificar se as Regras Estão Publicadas:

No Firebase Console → Firestore Database → Rules:
- Deve ter a função `isOwner(userId)`
- Deve ter a linha: `allow create: if isAuthenticated() && isOwner(userId);`

Se não tiver, as regras NÃO foram publicadas corretamente.

---

**👉 FAÇA ISSO AGORA! Sem publicar as regras, o sistema não funciona.**