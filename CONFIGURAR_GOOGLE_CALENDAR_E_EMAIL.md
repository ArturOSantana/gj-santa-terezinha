# 📧 Configurar E-mail e 📅 Google Calendar API

## 🚨 PROBLEMAS ATUAIS

### 1. ❌ E-mail Falhando (0 enviados, 1 falha)
**Causa:** Credenciais do Gmail não configuradas nas Firebase Functions

### 2. ❓ Google Calendar API
**Status:** Precisa configurar variáveis de ambiente

---

## 📧 PARTE 1: Configurar E-mail (Gmail)

### Passo 1: Criar Senha de App do Gmail

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login com a conta Gmail que vai enviar os e-mails
3. Clique em "Criar senha de app"
4. Nome: `GJ Santa Terezinha`
5. Copie a senha gerada (16 caracteres, ex: `abcd efgh ijkl mnop`)

### Passo 2: Configurar no Firebase Functions

```bash
# No terminal, execute:
firebase functions:config:set gmail.user="seu-email@gmail.com"
firebase functions:config:set gmail.password="abcd efgh ijkl mnop"
```

**Exemplo:**
```bash
firebase functions:config:set gmail.user="gjsantaterezinha@gmail.com"
firebase functions:config:set gmail.password="xpto abcd 1234 5678"
```

### Passo 3: Redeploy das Functions

```bash
firebase deploy --only functions
```

### Passo 4: Testar

1. Acesse: https://gj-santaterezinha.web.app
2. Vá em "Boa Nova"
3. Tente enviar um e-mail de teste

---

## 📅 PARTE 2: Configurar Google Calendar API

### Opção A: Usar API Key (Somente Leitura - RECOMENDADO)

#### Passo 1: Criar API Key

1. Acesse: https://console.cloud.google.com/apis/credentials?project=gj-santaterezinha
2. Clique em "+ CRIAR CREDENCIAIS"
3. Selecione "Chave de API"
4. Copie a chave gerada (ex: `AIzaSyD...`)
5. Clique em "RESTRINGIR CHAVE"
6. Em "Restrições de API":
   - Selecione "Restringir chave"
   - Marque apenas: **Google Calendar API**
7. Salvar

#### Passo 2: Ativar Google Calendar API

1. Acesse: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=gj-santaterezinha
2. Clique em "ATIVAR"

#### Passo 3: Configurar Variáveis de Ambiente

```bash
# No terminal:
firebase functions:config:set google.calendar_api_key="AIzaSyD..."
firebase functions:config:set google.calendar_id="seu-calendario@group.calendar.google.com"
```

**Como encontrar o Calendar ID:**
1. Abra Google Calendar: https://calendar.google.com
2. Clique nos 3 pontos do calendário → "Configurações e compartilhamento"
3. Role até "Integrar calendário"
4. Copie o "ID do calendário" (ex: `abc123@group.calendar.google.com`)

#### Passo 4: Redeploy

```bash
firebase deploy --only functions
```

---

### Opção B: Usar Service Account (Leitura + Escrita)

**Use esta opção se quiser criar/editar/deletar eventos pelo sistema**

#### Passo 1: Criar Service Account

1. Acesse: https://console.cloud.google.com/iam-admin/serviceaccounts?project=gj-santaterezinha
2. Clique em "+ CRIAR CONTA DE SERVIÇO"
3. Nome: `gj-calendar-service`
4. Descrição: `Service account para Google Calendar`
5. Clique em "CRIAR E CONTINUAR"
6. Papel: `Editor` (ou `Proprietário`)
7. Clique em "CONCLUIR"

#### Passo 2: Gerar Chave JSON

1. Clique na service account criada
2. Vá em "CHAVES"
3. Clique em "ADICIONAR CHAVE" → "Criar nova chave"
4. Tipo: **JSON**
5. Clique em "CRIAR"
6. Arquivo JSON será baixado (ex: `gj-santaterezinha-abc123.json`)

#### Passo 3: Compartilhar Calendário com Service Account

1. Abra o arquivo JSON baixado
2. Copie o valor de `client_email` (ex: `gj-calendar-service@gj-santaterezinha.iam.gserviceaccount.com`)
3. Abra Google Calendar: https://calendar.google.com
4. Clique nos 3 pontos do calendário → "Configurações e compartilhamento"
5. Em "Compartilhar com pessoas específicas":
   - Clique em "+ Adicionar pessoas"
   - Cole o `client_email`
   - Permissão: **Fazer alterações em eventos**
6. Clique em "Enviar"

#### Passo 4: Configurar no Firebase

```bash
# Converter JSON para string (uma linha)
# No Mac/Linux:
cat gj-santaterezinha-abc123.json | tr -d '\n' | pbcopy

# Configurar:
firebase functions:config:set google.service_account_key='{"type":"service_account","project_id":"gj-santaterezinha",...}'
firebase functions:config:set google.calendar_id="seu-calendario@group.calendar.google.com"
```

**OU** adicione no arquivo `.env` das Functions:

```bash
# functions/.env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"gj-santaterezinha",...}'
GOOGLE_CALENDAR_ID="seu-calendario@group.calendar.google.com"
```

#### Passo 5: Redeploy

```bash
firebase deploy --only functions
```

---

## ✅ VERIFICAR SE FUNCIONOU

### E-mail:
```bash
# Ver configurações atuais:
firebase functions:config:get

# Deve mostrar:
# {
#   "gmail": {
#     "user": "seu-email@gmail.com",
#     "password": "sua-senha-app"
#   }
# }
```

### Google Calendar:
1. Acesse: https://gj-santaterezinha.web.app/calendar
2. Deve carregar eventos do Google Calendar
3. Se aparecer erro, abra DevTools (F12) e veja o console

---

## 🔧 TROUBLESHOOTING

### E-mail não envia:

1. **Verificar senha de app:**
   ```bash
   firebase functions:config:get gmail
   ```

2. **Verificar logs:**
   ```bash
   firebase functions:log --only sendEmailBroadcast
   ```

3. **Senha incorreta?**
   - Gere nova senha de app
   - Configure novamente
   - Redeploy

### Google Calendar não carrega:

1. **API não ativada:**
   - Ative em: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=gj-santaterezinha

2. **API Key incorreta:**
   ```bash
   firebase functions:config:get google
   ```

3. **Calendar ID incorreto:**
   - Verifique em: https://calendar.google.com → Configurações do calendário

4. **Service Account sem permissão:**
   - Compartilhe o calendário com o `client_email` da service account

---

## 📝 RESUMO DOS COMANDOS

```bash
# 1. Configurar E-mail
firebase functions:config:set gmail.user="seu-email@gmail.com"
firebase functions:config:set gmail.password="sua-senha-app"

# 2. Configurar Google Calendar (Opção A - API Key)
firebase functions:config:set google.calendar_api_key="AIzaSyD..."
firebase functions:config:set google.calendar_id="calendario@group.calendar.google.com"

# 3. Redeploy
firebase deploy --only functions

# 4. Verificar
firebase functions:config:get
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Configure o e-mail primeiro (mais importante)
2. ✅ Teste o envio de e-mails
3. ✅ Configure o Google Calendar
4. ✅ Teste a sincronização de eventos

---

**Última atualização:** 26/05/2026 14:19 BRT
**Status:** Aguardando configuração das credenciais