# 🚀 Configuração CI/CD - GitHub Actions + Firebase Hosting

Este guia explica como configurar o deploy automático para o Firebase Hosting usando GitHub Actions.

## 📋 Pré-requisitos

- Repositório Git configurado
- Conta GitHub
- Projeto Firebase configurado
- Firebase CLI instalado

## 🔧 Passo 1: Gerar Service Account do Firebase

### 1.1 Via Firebase CLI (Recomendado)

```bash
# Fazer login no Firebase
firebase login

# Gerar service account e salvar em arquivo
firebase init hosting:github
```

O comando acima irá:
- Conectar seu repositório GitHub
- Criar automaticamente o secret `FIREBASE_SERVICE_ACCOUNT`
- Configurar o workflow básico

### 1.2 Via Console do Firebase (Manual)

Se preferir fazer manualmente:

1. Acesse o [Console do Firebase](https://console.firebase.google.com)
2. Selecione seu projeto: **gj-santaterezinha**
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Aba **Contas de Serviço**
5. Clique em **Gerar nova chave privada**
6. Salve o arquivo JSON

## 🔐 Passo 2: Configurar Secret no GitHub

### 2.1 Acessar Configurações do Repositório

1. Vá para seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**

### 2.2 Adicionar o Secret

- **Name**: `FIREBASE_SERVICE_ACCOUNT`
- **Value**: Cole todo o conteúdo do arquivo JSON da service account

Exemplo do JSON:
```json
{
  "type": "service_account",
  "project_id": "gj-santaterezinha",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## 📝 Passo 3: Workflow Configurado

O arquivo `.github/workflows/firebase-hosting.yml` já está criado com a seguinte configuração:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Build do projeto
        run: npm run build
        env:
          CI: false

      - name: Deploy para Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: gj-santaterezinha
```

### O que o workflow faz:

1. **Trigger**: Executa automaticamente quando você faz push para `main` ou `master`
2. **Checkout**: Baixa o código do repositório
3. **Setup Node.js**: Configura Node.js 20 com cache do npm
4. **Instalar dependências**: Executa `npm ci` (mais rápido que `npm install`)
5. **Build**: Executa `npm run build` para gerar a pasta `dist/`
6. **Deploy**: Faz deploy automático para Firebase Hosting

## 🚀 Passo 4: Testar o Deploy Automático

### 4.1 Fazer Commit e Push

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: adicionar CI/CD com GitHub Actions"

# Fazer push para o repositório
git push origin main
```

### 4.2 Acompanhar o Deploy

1. Vá para seu repositório no GitHub
2. Clique na aba **Actions**
3. Você verá o workflow "Deploy to Firebase Hosting" em execução
4. Clique no workflow para ver os logs em tempo real

### 4.3 Verificar o Deploy

Após o workflow terminar com sucesso:
- ✅ Status: Verde (sucesso)
- 🌐 URL: https://gj-santaterezinha.web.app
- ⏱️ Tempo: ~2-3 minutos

## 🔄 Fluxo de Trabalho

```
┌─────────────────┐
│  git add .      │
│  git commit -m  │
│  git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ detecta push    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Instala deps    │
│ npm ci          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build projeto   │
│ npm run build   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Firebase │
│ Hosting         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ✅ Site Online  │
│ gj-santa...app  │
└─────────────────┘
```

## 🎯 Comandos Úteis

### Deploy Manual (se necessário)
```bash
npm run build
firebase deploy --only hosting
```

### Ver Logs do Workflow
```bash
# No GitHub, vá para Actions → Selecione o workflow → View logs
```

### Cancelar Deploy em Andamento
```bash
# No GitHub Actions, clique em "Cancel workflow"
```

## 🐛 Troubleshooting

### Erro: "FIREBASE_SERVICE_ACCOUNT not found"
**Solução**: Verifique se o secret foi criado corretamente no GitHub

### Erro: "Permission denied"
**Solução**: Verifique se a service account tem permissões de deploy

### Erro: "Build failed"
**Solução**: Teste o build localmente com `npm run build`

### Workflow não executa
**Solução**: 
- Verifique se o arquivo está em `.github/workflows/`
- Verifique se você fez push para `main` ou `master`
- Verifique se Actions está habilitado no repositório

## 📊 Monitoramento

### Ver Histórico de Deploys
1. Firebase Console → Hosting
2. Veja todos os deploys com timestamps
3. Possibilidade de rollback se necessário

### Ver Logs do GitHub Actions
1. GitHub → Actions
2. Histórico completo de todos os workflows
3. Logs detalhados de cada etapa

## 🎉 Benefícios do CI/CD

✅ **Deploy Automático**: Sem necessidade de comandos manuais
✅ **Consistência**: Mesmo processo sempre
✅ **Rastreabilidade**: Histórico completo no GitHub
✅ **Rollback Fácil**: Voltar para versão anterior se necessário
✅ **Economia de Tempo**: 2-3 minutos por deploy
✅ **Menos Erros**: Processo automatizado e testado

## 📚 Recursos Adicionais

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase GitHub Action](https://github.com/FirebaseExtended/action-hosting-deploy)

---

**Projeto**: GJ Santa Terezinha
**Data**: 2026-05-26