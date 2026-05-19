# 🗓️ Configuração do Google Calendar com Service Account

Este guia explica como configurar a sincronização bidirecional com o Google Calendar usando uma Service Account.

## 📋 Pré-requisitos

- Conta Google
- Acesso ao [Google Cloud Console](https://console.cloud.google.com)
- Acesso ao calendário do Google que deseja sincronizar

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em **"Select a project"** → **"New Project"**
3. Nome do projeto: `GJ Santa Terezinha`
4. Clique em **"Create"**

### 2. Ativar Google Calendar API

1. No menu lateral, vá em **"APIs & Services"** → **"Library"**
2. Busque por **"Google Calendar API"**
3. Clique em **"Enable"**

### 3. Criar Service Account

1. No menu lateral, vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"Create Credentials"** → **"Service Account"**
3. Preencha:
   - **Service account name**: `gj-calendar-sync`
   - **Service account ID**: `gj-calendar-sync` (gerado automaticamente)
   - **Description**: `Service account para sincronizar eventos do GJ com Google Calendar`
4. Clique em **"Create and Continue"**
5. Em **"Grant this service account access to project"**, selecione:
   - Role: **"Editor"** (ou **"Owner"** para acesso total)
6. Clique em **"Continue"** → **"Done"**

### 4. Criar Chave JSON

1. Na lista de Service Accounts, clique na que você acabou de criar
2. Vá na aba **"Keys"**
3. Clique em **"Add Key"** → **"Create new key"**
4. Selecione **"JSON"**
5. Clique em **"Create"**
6. Um arquivo JSON será baixado automaticamente
7. **⚠️ IMPORTANTE**: Guarde este arquivo em local seguro! Ele contém credenciais sensíveis.

### 5. Compartilhar Calendário com Service Account

1. Abra o arquivo JSON baixado
2. Copie o valor do campo `"client_email"` (algo como: `gj-calendar-sync@projeto-123456.iam.gserviceaccount.com`)
3. Acesse [Google Calendar](https://calendar.google.com)
4. No calendário que deseja sincronizar:
   - Clique nos **3 pontos** ao lado do nome do calendário
   - Selecione **"Settings and sharing"**
5. Role até **"Share with specific people"**
6. Clique em **"Add people"**
7. Cole o email da Service Account (`client_email`)
8. Selecione permissão: **"Make changes to events"**
9. Clique em **"Send"**

### 6. Obter Calendar ID

1. Ainda nas configurações do calendário
2. Role até **"Integrate calendar"**
3. Copie o **"Calendar ID"** (algo como: `abc123@group.calendar.google.com`)

### 7. Configurar Variáveis de Ambiente no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `gj-santa-terezinha`
3. Vá em **"Settings"** → **"Environment Variables"**
4. Adicione as seguintes variáveis:

#### GOOGLE_SERVICE_ACCOUNT_KEY
- **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY`
- **Value**: Cole o **conteúdo completo** do arquivo JSON (todo o JSON, não apenas um campo)
- **Environment**: Production, Preview, Development
- Clique em **"Save"**

#### VITE_GOOGLE_CALENDAR_ID (atualizar)
- **Name**: `VITE_GOOGLE_CALENDAR_ID`
- **Value**: Cole o Calendar ID copiado no passo 6
- **Environment**: Production, Preview, Development
- Clique em **"Save"**

### 8. Fazer Redeploy

1. No Vercel, vá na aba **"Deployments"**
2. Clique nos **3 pontos** do último deployment
3. Selecione **"Redeploy"**
4. Aguarde o deploy finalizar

## ✅ Testar a Integração

1. Acesse o site: https://gjsantaterezinha.vercel.app
2. Faça login como admin
3. Vá no **Calendário**
4. Crie um novo evento
5. Verifique se o evento aparece no Google Calendar
6. Edite ou delete o evento no site
7. Verifique se as mudanças aparecem no Google Calendar

## 🔍 Verificar Logs

Para ver se está funcionando:

1. Abra o Console do navegador (F12)
2. Vá na aba **"Console"**
3. Ao criar/editar/deletar eventos, você verá mensagens:
   - ✅ `Evento criado no Google Calendar: xyz123`
   - ✅ `Evento atualizado no Google Calendar: xyz123`
   - ✅ `Evento deletado do Google Calendar: xyz123`
   - ❌ `Erro ao criar evento no Google Calendar: ...`

## 🔒 Segurança

- ⚠️ **NUNCA** commite o arquivo JSON no Git
- ⚠️ **NUNCA** compartilhe o arquivo JSON publicamente
- ✅ O arquivo JSON fica apenas no Vercel (variável de ambiente)
- ✅ O frontend não tem acesso às credenciais
- ✅ Toda comunicação com Google Calendar passa pela API serverless

## 🐛 Troubleshooting

### Erro: "Calendar ID não configurado"
- Verifique se `VITE_GOOGLE_CALENDAR_ID` está configurado no Vercel
- Faça redeploy após adicionar a variável

### Erro: "Credenciais do Google não configuradas"
- Verifique se `GOOGLE_SERVICE_ACCOUNT_KEY` está configurado no Vercel
- Certifique-se de que colou o JSON completo (não apenas um campo)
- Faça redeploy após adicionar a variável

### Erro: "Permission denied"
- Verifique se compartilhou o calendário com o email da Service Account
- Certifique-se de que deu permissão "Make changes to events"

### Eventos não aparecem no Google Calendar
- Verifique os logs no Console do navegador
- Verifique se o Calendar ID está correto
- Teste criar um evento manualmente no Google Calendar para ver se aparece no site

## 📚 Recursos Adicionais

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎉 Pronto!

Agora o sistema está sincronizando automaticamente com o Google Calendar! 🚀

Eventos criados no site aparecem no Google Calendar.
Eventos do Google Calendar aparecem no site.
Edições e exclusões são sincronizadas em ambos os lados.