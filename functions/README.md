# Firebase Functions - Sistema Boa Nova

## 📧 Configuração do E-mail (Gmail SMTP)

### 1. Criar Senha de App do Gmail

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Outro (nome personalizado)"
3. Digite: "Boa Nova - GJ Santa Terezinha"
4. Clique em "Gerar"
5. Copie a senha de 16 caracteres gerada

### 2. Configurar Variáveis de Ambiente

#### Opção A: Firebase Functions Config (Recomendado para produção)

```bash
firebase functions:config:set gmail.user="grupodjovens@terezinha.santa"
firebase functions:config:set gmail.password="xxxx-xxxx-xxxx-xxxx"
```

#### Opção B: Arquivo .env (Para desenvolvimento local)

Crie um arquivo `.env` na pasta `functions/`:

```env
GMAIL_USER=grupodjovens@terezinha.santa
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### 3. Instalar Dependências

```bash
cd functions
npm install
```

### 4. Compilar TypeScript

```bash
npm run build
```

### 5. Testar Localmente (Opcional)

```bash
npm run serve
```

### 6. Deploy para Produção

```bash
npm run deploy
```

## 📋 Functions Disponíveis

### `sendEmailBroadcast`
Envia broadcast de e-mails para uma lista de destinatários.

**Parâmetros:**
- `recipients`: string[] - Lista de e-mails
- `subject`: string - Assunto do e-mail
- `message`: string - Corpo da mensagem
- `imageUrl`: string (opcional) - URL da imagem

**Retorno:**
```typescript
{
  success: boolean;
  broadcastId: string;
  sent: number;
  failed: number;
}
```

### `verifyEmail`
Verifica se o serviço de e-mail está configurado corretamente.

**Retorno:**
```typescript
{
  success: boolean;
  message: string;
}
```

### `cleanupOldBroadcasts`
Scheduled function que executa diariamente para limpar broadcasts com mais de 7 dias.

## 🔒 Segurança

- Apenas coordenadores e administradores podem enviar broadcasts
- Validação de autenticação em todas as functions
- Rate limiting implementado
- Logs de auditoria

## 📊 Limites

- **Gmail SMTP Gratuito**: 500 e-mails/dia
- **Delay entre e-mails**: 1 segundo
- **Batch size**: 50 e-mails por lote

## 🐛 Troubleshooting

### Erro: "Credenciais do Gmail não configuradas"
Execute os comandos de configuração acima.

### Erro: "Authentication failed"
Verifique se a senha de app está correta e se a autenticação de 2 fatores está ativada no Gmail.

### Erro: "Daily sending quota exceeded"
Você atingiu o limite de 500 e-mails/dia do Gmail SMTP gratuito. Aguarde 24 horas.

## 📚 Documentação

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Nodemailer](https://nodemailer.com/)
- [Gmail SMTP](https://support.google.com/mail/answer/7126229)

---

