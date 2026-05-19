# Solução para Erro: Firebase API Key Not Valid

## Problema
Você está recebendo o erro:
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Causa
Este erro ocorre quando a API Key do Firebase tem restrições configuradas que impedem seu uso no domínio atual (localhost ou Vercel).

## Solução Passo a Passo

### 1. Acesse o Console do Firebase
1. Vá para: https://console.firebase.google.com/
2. Selecione seu projeto: **gj-santaterezinha**

### 2. Acesse as Configurações da API Key

#### Opção A: Via Firebase Console
1. No menu lateral, clique em **⚙️ Configurações do Projeto** (Project Settings)
2. Role até a seção **Suas apps** (Your apps)
3. Encontre seu app Web
4. Clique em **Configurações do app** ou no ícone de engrenagem

#### Opção B: Via Google Cloud Console (Recomendado)
1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto: **gj-santaterezinha**
3. No menu lateral, vá em: **APIs e serviços** → **Credenciais**
4. Encontre a chave: **Browser key (auto created by Firebase)**
5. Clique nela para editar

### 3. Configure as Restrições da API Key

Você tem duas opções:

#### Opção 1: Remover Restrições (Mais Simples - Desenvolvimento)
1. Na seção **Restrições de aplicativo**, selecione: **Nenhuma**
2. Clique em **Salvar**

⚠️ **Atenção**: Esta opção é menos segura, mas funciona para desenvolvimento.

#### Opção 2: Adicionar Domínios Permitidos (Recomendado - Produção)
1. Na seção **Restrições de aplicativo**, selecione: **Referenciadores HTTP (sites)**
2. Adicione os seguintes domínios:
   ```
   localhost:5173/*
   localhost:3000/*
   127.0.0.1:5173/*
   127.0.0.1:3000/*
   *.vercel.app/*
   seu-dominio-personalizado.com/*
   ```
3. Clique em **Salvar**

### 4. Verifique as APIs Habilitadas

Certifique-se de que as seguintes APIs estão habilitadas:

1. No Google Cloud Console, vá em: **APIs e serviços** → **Biblioteca**
2. Procure e habilite:
   - ✅ **Identity Toolkit API** (para autenticação)
   - ✅ **Cloud Firestore API** (para banco de dados)
   - ✅ **Firebase Authentication API**

### 5. Reinicie o Servidor de Desenvolvimento

Após fazer as alterações:

```bash
# Pare o servidor (Ctrl+C)
# Reinicie
cd gj-santa-terezinha
npm run dev
```

### 6. Limpe o Cache do Navegador

1. Abra as Ferramentas do Desenvolvedor (F12)
2. Vá em **Application** → **Storage**
3. Clique em **Clear site data**
4. Recarregue a página (Ctrl+Shift+R ou Cmd+Shift+R)

## Verificação

Após seguir os passos acima, você deve ver no console do navegador:

✅ **Sucesso**: Sem erros de API Key
❌ **Ainda com erro**: Verifique se salvou as alterações e reiniciou o servidor

## Alternativa: Criar Nova API Key

Se o problema persistir, crie uma nova API Key:

1. No Google Cloud Console → **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** → **Chave de API**
3. Configure as restrições conforme a Opção 2 acima
4. Copie a nova chave
5. Atualize o arquivo `.env`:
   ```
   VITE_FIREBASE_API_KEY=sua-nova-chave-aqui
   ```
6. Reinicie o servidor

## Configuração para Produção (Vercel)

No Vercel, você precisa adicionar as variáveis de ambiente:

1. Acesse: https://vercel.com/
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione todas as variáveis do arquivo `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Faça um novo deploy

## Dicas de Segurança

### Para Desenvolvimento
- ✅ Use restrições de domínio (localhost)
- ✅ Nunca commite o arquivo `.env` no Git
- ✅ Use `.env.example` como template

### Para Produção
- ✅ Configure restrições de domínio específicas
- ✅ Use variáveis de ambiente no Vercel
- ✅ Habilite apenas as APIs necessárias
- ✅ Configure regras de segurança no Firestore

## Regras de Segurança do Firestore

Certifique-se de que suas regras do Firestore estão configuradas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Suporte

Se o problema persistir após seguir todos os passos:

1. Verifique o console do navegador para erros detalhados
2. Verifique o console do Firebase para logs
3. Certifique-se de que o projeto Firebase está ativo
4. Verifique se há cobranças pendentes no Firebase

## Links Úteis

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentação Firebase Auth](https://firebase.google.com/docs/auth)
- [Documentação Firestore](https://firebase.google.com/docs/firestore)

---

**Última atualização**: 19/05/2026  
**Versão do Sistema**: 2.0.0