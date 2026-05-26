# 🚨 CORREÇÃO URGENTE - Produção

## ❌ Problemas Identificados

### 1. Functions não deployadas (404 CORS Error)
**Erro:** `https://us-central1-gj-santaterezinha.cloudfunctions.net/startWhatsAppSession` retorna 404

**Causa:** As Functions não foram deployadas para produção

### 2. Bug no código de estatísticas
**Erro:** `TypeError: can't access property "pending", e.recipients is undefined`

**Causa:** Código tentava acessar `broadcast.recipients.sent` sem verificar se `recipients` existe

**Status:** ✅ CORRIGIDO no commit anterior

---

## 🔧 Solução Passo a Passo

### PASSO 1: Fazer Build do Frontend com Correção

```bash
# 1. Ir para a raiz do projeto
cd /Users/artur.santana/estudos/gj/ideia1/gj-santa-terezinha

# 2. Fazer build do frontend
npm run build

# 3. Verificar se dist/ foi criado
ls -la dist/
```

### PASSO 2: Deploy do Frontend (Vercel)

```bash
# Se estiver usando Vercel CLI
vercel --prod

# OU fazer commit e push (se tiver CI/CD configurado)
git add .
git commit -m "fix: corrigir bug de estatísticas e preparar para deploy"
git push origin main
```

### PASSO 3: Compilar Functions

```bash
# 1. Ir para pasta functions
cd functions

# 2. Instalar dependências (se necessário)
npm install

# 3. Compilar TypeScript
npm run build

# 4. Verificar se lib/ foi criado
ls -la lib/

# 5. Voltar para raiz
cd ..
```

### PASSO 4: Configurar Variáveis de Ambiente em Produção

```bash
# Configurar credenciais do Gmail
firebase functions:config:set gmail.user="seu-email@gmail.com"
firebase functions:config:set gmail.password="xxxx-xxxx-xxxx-xxxx"

# Verificar configuração
firebase functions:config:get
```

### PASSO 5: Deploy das Functions

```bash
# Deploy APENAS das Functions
firebase deploy --only functions

# Aguardar conclusão (pode levar 5-10 minutos)
```

### PASSO 6: Verificar Deploy

```bash
# Listar Functions deployadas
firebase functions:list

# Deve mostrar:
# - sendEmailBroadcast
# - verifyEmail
# - startWhatsAppSession
# - checkWhatsAppSession
# - endWhatsAppSession
# - sendWhatsAppBroadcast
# - cleanupOldBroadcasts
# - cleanupExpiredWhatsAppSessions
```

### PASSO 7: Testar em Produção

1. **Acessar:** https://gjsantaterezinha.vercel.app
2. **Fazer login** como admin/coordenador
3. **Ir para Boa Nova → E-mail**
4. **Clicar em "Verificar Serviço"**
   - ✅ Deve funcionar sem erro CORS
   - ✅ Deve mostrar status do serviço

---

## 📊 Checklist de Verificação

### Antes do Deploy:
- [ ] Código corrigido (bug de estatísticas)
- [ ] Frontend buildado (`npm run build`)
- [ ] Functions compiladas (`cd functions && npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Plano Blaze ativo no Firebase

### Após o Deploy:
- [ ] Functions listadas em `firebase functions:list`
- [ ] Frontend acessível em produção
- [ ] Sem erros CORS no console
- [ ] "Verificar Serviço" funciona
- [ ] Estatísticas carregam sem erro

---

## 🐛 Se Ainda Houver Erros

### Erro: "CORS header missing"
**Solução:** Functions não foram deployadas corretamente

```bash
# Verificar logs
firebase functions:log

# Tentar deploy novamente
firebase deploy --only functions --force
```

### Erro: "Internal"
**Solução:** Verificar logs das Functions

```bash
# Ver logs em tempo real
firebase functions:log --only startWhatsAppSession

# Ver últimos erros
firebase functions:log --limit 50
```

### Erro: "Unauthenticated"
**Solução:** Verificar regras do Firestore

```bash
# Ver regras atuais
cat firestore.rules

# Deploy das regras
firebase deploy --only firestore:rules
```

---

## 📝 Comandos Úteis

```bash
# Ver status do projeto
firebase projects:list

# Ver configuração atual
firebase functions:config:get

# Ver logs em tempo real
firebase functions:log --only sendEmailBroadcast

# Deletar uma Function (se necessário)
firebase functions:delete startWhatsAppSession

# Deploy completo (tudo)
firebase deploy

# Deploy apenas hosting
firebase deploy --only hosting

# Deploy apenas firestore
firebase deploy --only firestore
```

---

## ⚠️ IMPORTANTE

### Custos do Firebase Blaze Plan

**Functions:**
- Primeiras 2 milhões de invocações: GRÁTIS
- Após isso: $0.40 por milhão
- Primeiros 400.000 GB-segundos: GRÁTIS
- Primeiros 200.000 GHz-segundos: GRÁTIS

**Estimativa para GJ Santa Terezinha:**
- ~100 envios/mês = ~$0.50/mês
- Muito abaixo do limite gratuito

### Configurar Limite de Gastos

```bash
# Acessar console do Firebase
open https://console.firebase.google.com

# Ir em: Configurações → Uso e faturamento → Detalhes e configurações
# Definir: Limite de gastos = $5/mês (segurança)
```

---

## 🎯 Próximos Passos Após Deploy

1. **Testar Email:**
   - Enviar email de teste
   - Verificar recebimento
   - Checar histórico

2. **Testar WhatsApp:**
   - Gerar QR Code
   - Conectar celular
   - Enviar mensagem de teste

3. **Monitorar:**
   - Acessar Firebase Console
   - Ver métricas de uso
   - Verificar logs de erro

4. **Documentar:**
   - Anotar URLs das Functions
   - Documentar processo de deploy
   - Criar runbook para equipe

---

## 📞 Suporte

Se precisar de ajuda:

1. **Logs das Functions:**
   ```bash
   firebase functions:log --limit 100
   ```

2. **Console do Firebase:**
   https://console.firebase.google.com

3. **Status do Firebase:**
   https://status.firebase.google.com

---

**Última atualização:** 26/05/2026 13:22 BRT
**Status:** 🚨 AÇÃO NECESSÁRIA - Deploy pendente