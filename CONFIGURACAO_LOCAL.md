# 🔧 Configuração para Testes Locais

## ⚠️ Problemas Identificados

### 1. E-mail - Credenciais Inválidas
**Erro:** `535-5.7.8 Username and Password not accepted`

**Causa:** O arquivo `functions/.env` está com credenciais de exemplo:
```
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=xxir-uans-etbv-dlxa
```

### 2. WhatsApp - Timeout ao Gerar QR Code
**Erro:** `Timeout ao gerar QR Code`

**Causa:** A biblioteca Baileys precisa de mais tempo para inicializar e gerar o QR Code.

---

## 🔧 SOLUÇÃO 1: Configurar E-mail (Opcional)

### Passo 1: Gerar Senha de App do Gmail

1. **Acesse:** https://myaccount.google.com/apppasswords
   - Faça login com sua conta Gmail
   - Você PRECISA ter autenticação de 2 fatores ativada

2. **Criar senha de app:**
   - Nome do app: "GJ Santa Terezinha"
   - Clique em "Gerar"
   - Copie a senha de 16 caracteres (ex: `abcd efgh ijkl mnop`)

### Passo 2: Atualizar functions/.env

```bash
# Edite o arquivo
nano functions/.env

# Ou use seu editor preferido
code functions/.env
```

**Substitua:**
```env
GMAIL_USER=seu-email-real@gmail.com
GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
```

### Passo 3: Reiniciar Emulator

```bash
# Parar emulator (Ctrl+C no terminal 2)
# Reiniciar
firebase emulators:start --only functions
```

---

## 🔧 SOLUÇÃO 2: Aumentar Timeout do WhatsApp

O timeout padrão pode ser muito curto. Vou criar uma versão com timeout maior.

### Opção A: Testar Sem WhatsApp Primeiro

**Teste apenas o E-mail:**
1. Configure as credenciais do Gmail (acima)
2. Reinicie o emulator
3. Teste a aba "E-mail" primeiro
4. Depois teste WhatsApp

### Opção B: Aumentar Timeout (Requer Alteração no Código)

O problema é que o Baileys pode levar 30-60 segundos para gerar o QR Code na primeira vez.

**Solução temporária:** Aguarde mais tempo (até 60 segundos) após clicar em "Conectar WhatsApp"

---

## 🧪 TESTES RECOMENDADOS

### 1. Testar E-mail Primeiro ✅

**Por quê?**
- Mais rápido de configurar
- Não depende de bibliotecas pesadas
- Valida que o emulator está funcionando

**Como:**
1. Configure Gmail (passos acima)
2. Reinicie emulator
3. Acesse "Boa Nova" > "E-mail"
4. Clique em "Verificar Serviço"
5. Deve mostrar: ✅ "Serviço de e-mail configurado corretamente"

### 2. Testar WhatsApp Depois ⏳

**Por quê?**
- Baileys é pesado e lento na primeira execução
- Pode levar 30-60 segundos
- Requer paciência

**Como:**
1. Acesse "Boa Nova" > "WhatsApp"
2. Clique em "Conectar WhatsApp"
3. **AGUARDE 60 segundos** ⏳
4. QR Code deve aparecer
5. Escaneie com seu celular

---

## 🐛 Troubleshooting

### E-mail: "Username and Password not accepted"

**Soluções:**
1. ✅ Verifique se 2FA está ativado no Gmail
2. ✅ Gere uma nova senha de app
3. ✅ Use a senha de app (16 caracteres), NÃO a senha normal
4. ✅ Remova espaços da senha no .env
5. ✅ Reinicie o emulator

### WhatsApp: "Timeout ao gerar QR Code"

**Soluções:**
1. ✅ Aguarde mais tempo (até 60 segundos)
2. ✅ Verifique logs do emulator (terminal 2)
3. ✅ Reinicie o emulator
4. ✅ Tente novamente

**Logs esperados no emulator:**
```
>  Iniciando sessão WhatsApp...
>  Gerando QR Code...
>  QR Code gerado com sucesso
```

### Emulator não responde

**Soluções:**
```bash
# Parar tudo
# Ctrl+C em ambos os terminais

# Limpar processos
killall -9 node

# Reiniciar emulator
firebase emulators:start --only functions

# Em outro terminal, reiniciar app
npm run dev
```

---

## 📊 Status Esperado

### ✅ E-mail Configurado
```
Verificar Serviço → ✅ Sucesso
Enviar E-mail → ✅ Funciona
```

### ⏳ WhatsApp (Pode Demorar)
```
Conectar WhatsApp → ⏳ Aguardando (30-60s)
QR Code → ✅ Aparece
Escanear → ✅ Conecta
```

---

## 🎯 Checklist de Configuração

### E-mail
- [ ] 2FA ativado no Gmail
- [ ] Senha de app gerada
- [ ] `functions/.env` atualizado com credenciais reais
- [ ] Emulator reiniciado
- [ ] Teste "Verificar Serviço" passou

### WhatsApp
- [ ] Emulator rodando
- [ ] Aguardou 60 segundos após clicar
- [ ] QR Code apareceu
- [ ] Celular pronto para escanear

---

## 💡 Dicas

### Para E-mail
- Use um e-mail de teste, não o principal
- Configure limite de envio no Gmail
- Teste com poucos destinatários primeiro

### Para WhatsApp
- Primeira execução é sempre mais lenta
- Baileys precisa baixar dependências
- Após primeira vez, fica mais rápido
- Mantenha o celular próximo para escanear

---

## 🚀 Próximos Passos

### 1. Configure E-mail (5 minutos)
```bash
# 1. Gere senha de app do Gmail
# 2. Edite functions/.env
# 3. Reinicie emulator
# 4. Teste "Verificar Serviço"
```

### 2. Teste E-mail (2 minutos)
```bash
# 1. Selecione destinatários
# 2. Escreva mensagem
# 3. Envie
# 4. Verifique recebimento
```

### 3. Teste WhatsApp (10 minutos)
```bash
# 1. Clique "Conectar WhatsApp"
# 2. AGUARDE 60 segundos
# 3. Escaneie QR Code
# 4. Envie mensagem de teste
```

---

## 📞 Precisa de Ajuda?

### Logs do Emulator
```bash
# Ver logs em tempo real
# Terminal 2 mostra tudo
```

### Console do Navegador
```bash
# F12 → Console
# Veja erros e avisos
```

### Documentação
- **TROUBLESHOOTING.md** - Problemas comuns
- **DEPLOY_GUIDE.md** - Deploy em produção
- **functions/README.md** - Configuração das functions

---

## ✅ Resumo

**Para testar localmente:**

1. **Configure E-mail** (obrigatório para testar e-mail):
   - Gere senha de app do Gmail
   - Atualize `functions/.env`
   - Reinicie emulator

2. **Teste E-mail** (rápido):
   - Verificar Serviço
   - Enviar mensagem de teste

3. **Teste WhatsApp** (lento na primeira vez):
   - Aguarde 60 segundos
   - Escaneie QR Code
   - Envie mensagem de teste

**Tempo total:** 15-20 minutos

---

Made with ❤️ by Bob - Sistema Boa Nova 📢