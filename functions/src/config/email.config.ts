/**
 * Configuração de E-mail para o Sistema Boa Nova
 * GJ Santa Terezinha
 */

export const EMAIL_CONFIG = {
  // Remetente
  from: {
    email: 'grupodjovens@terezinha.santa',
    name: 'GJ Santa Terezinha - Boa Nova'
  },
  
  // Reply-to
  replyTo: 'grupodjovens@terezinha.santa',
  
  // Gmail SMTP (GRATUITO - até 500 e-mails/dia)
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
  },
  
  // Templates de e-mail
  templates: {
    broadcast: {
      subjectPrefix: '📢',
      footer: `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p><strong>GJ Santa Terezinha</strong></p>
          <p>Grupo de Jovens • Paróquia Santa Terezinha</p>
          <p style="margin-top: 10px;">
            Para não receber mais mensagens, acesse seu perfil no sistema e desative as notificações por e-mail.
          </p>
        </div>
      `
    }
  },
  
  // Limites
  limits: {
    dailyLimit: 500,        // Limite diário do Gmail SMTP gratuito
    batchSize: 50,          // Mensagens por lote
    delayBetweenEmails: 1000, // 1 segundo entre e-mails
  }
};

// Made with Bob - Sistema Boa Nova 📢