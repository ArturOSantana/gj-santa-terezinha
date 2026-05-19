# Como Corrigir o Erro "API Key Not Valid" do Firebase

## Erro Atual
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Causa
A API Key do Firebase pode estar restrita ou o domínio não está autorizado.

## Solução Passo a Passo

### 1. Acesse o Firebase Console
1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **gj-santaterezinha**

### 2. Verifique as Restrições da API Key

#### Opção A: Via Firebase Console
1. No menu lateral, clique em **⚙️ Configurações do Projeto**
2. Vá na aba **Geral**
3. Role até **Seus apps**
4. Encontre o app Web e clique em **Configuração**
5. Verifique se a API Key está correta: `AIzaSyCBKq7RUqSvrcrKer0f5Clt2GXyuR7PVzI`

#### Opção B: Via Google Cloud Console (Recomendado)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto **gj-santaterezinha**
3. No menu lateral, vá em **APIs e Serviços** > **Credenciais**
4. Encontre a API Key: `AIzaSyCBKq7RUqSvrcrKer0f5Clt2GXyuR7PVzI`
5. Clique na API Key para editar

### 3. Configure as Restrições da API Key

Na página de edição da API Key:

#### Restrições de Aplicativo
Selecione: **Referenciadores HTTP (sites)**

Adicione os seguintes referenciadores:
```
http://localhost:5173/*
http://localhost:*
https://*.vercel.app/*
https://gj-santa-terezinha.vercel.app/*
```

#### Restrições de API
Certifique-se de que as seguintes APIs estão habilitadas:
- ✅ Identity Toolkit API
- ✅ Token Service API
- ✅ Cloud Firestore API
- ✅ Firebase Authentication API

**OU** selecione "Não restringir chave" (menos seguro, mas funciona)

### 4. Habilite as APIs Necessárias

1. No Google Cloud Console, vá em **APIs e Serviços** > **Biblioteca**
2. Busque e habilite as seguintes APIs:
   - **Identity Toolkit API**
   - **Cloud Firestore API**
   - **Firebase Authentication API**

### 5. Verifique o Authentication no Firebase

1. No Firebase Console, vá em **Authentication**
2. Clique na aba **Sign-in method**
3. Certifique-se de que **Email/Password** está **Ativado**
4. Em **Domínios autorizados**, adicione:
   - `localhost`
   - `gj-santa-terezinha.vercel.app` (ou seu domínio Vercel)

### 6. Reinicie o Servidor de Desenvolvimento

Após fazer as alterações:

```bash
cd gj-santa-terezinha
# Pare o servidor (Ctrl+C)
npm run dev
```

### 7. Teste a Autenticação

1. Acesse `http://localhost:5173`
2. Tente fazer login ou criar uma conta
3. Se ainda der erro, verifique o console do navegador (F12)

## Solução Alternativa: Gerar Nova API Key

Se o problema persistir, gere uma nova API Key:

### No Firebase Console:
1. Vá em **⚙️ Configurações do Projeto** > **Geral**
2. Em **Seus apps**, clique no app Web
3. Clique em **Adicionar app** para criar um novo
4. Copie a nova configuração do Firebase
5. Atualize o arquivo `.env` com as novas credenciais

### No Google Cloud Console:
1. Vá em **APIs e Serviços** > **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** > **Chave de API**
3. Configure as restrições conforme o passo 3
4. Copie a nova API Key
5. Atualize `VITE_FIREBASE_API_KEY` no arquivo `.env`

## Verificação Final

Após aplicar as correções, teste:

```bash
# 1. Limpe o cache do navegador
# 2. Reinicie o servidor
cd gj-santa-terezinha
npm run dev

# 3. Acesse http://localhost:5173
# 4. Tente fazer login
```

## Notas Importantes

- ⚠️ Nunca commite o arquivo `.env` no Git
- ⚠️ As mudanças nas restrições da API Key podem levar alguns minutos para propagar
- ⚠️ Se usar "Não restringir chave", lembre-se de adicionar restrições depois
- ✅ Para produção, sempre use restrições de domínio específicas

## Suporte

Se o problema persistir:
1. Verifique os logs do Firebase Console em **Authentication** > **Usuários**
2. Verifique o console do navegador (F12) para erros detalhados
3. Confirme que o projeto Firebase está ativo e não foi desabilitado