/**
 * Serviço de E-mail para o Sistema Boa Nova
 * Utiliza Nodemailer com Gmail SMTP (GRATUITO)
 */

import * as nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email.config';

// Tipo para as credenciais do Gmail
interface GmailCredentials {
  user: string;
  pass: string;
}

// Criar transporter do Nodemailer
let transporter: nodemailer.Transporter | null = null;

/**
 * Inicializar o transporter com as credenciais do Gmail
 */
export function initializeEmailService(credentials: GmailCredentials): void {
  transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.smtp.host,
    port: EMAIL_CONFIG.smtp.port,
    secure: EMAIL_CONFIG.smtp.secure,
    auth: {
      user: credentials.user,
      pass: credentials.pass,
    },
  });
  
  console.log('✅ Serviço de e-mail inicializado');
}

/**
 * Verificar se o serviço está inicializado
 */
function ensureInitialized(): nodemailer.Transporter {
  if (!transporter) {
    throw new Error('Serviço de e-mail não inicializado. Chame initializeEmailService() primeiro.');
  }
  return transporter;
}

/**
 * Construir template HTML do e-mail
 */
export function buildEmailTemplate(message: string, imageUrl?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Boa Nova - GJ Santa Terezinha</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a4731 0%, #2d6b4a 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    📢 Boa Nova
                  </h1>
                  <p style="margin: 5px 0 0 0; color: #b8860b; font-size: 14px;">
                    GJ Santa Terezinha
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px 20px;">
                  ${imageUrl ? `
                    <div style="text-align: center; margin-bottom: 20px;">
                      <img src="${imageUrl}" alt="Imagem da mensagem" style="max-width: 100%; height: auto; border-radius: 8px;" />
                    </div>
                  ` : ''}
                  
                  <div style="color: #333333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                    ${message}
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
                  ${EMAIL_CONFIG.templates.broadcast.footer}
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Enviar um único e-mail
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const transport = ensureInitialized();
  
  await transport.sendMail({
    from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`,
    to,
    subject,
    html,
    replyTo: EMAIL_CONFIG.replyTo,
  });
  
  console.log(`📧 E-mail enviado para: ${to}`);
}

/**
 * Enviar broadcast de e-mails com delays
 */
export async function sendBroadcastEmails(
  recipients: string[],
  subject: string,
  message: string,
  imageUrl?: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const html = buildEmailTemplate(message, imageUrl);
  
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const email of recipients) {
    try {
      await sendEmail(email, subject, html);
      sent++;
      
      // Delay entre e-mails (anti-spam)
      await delay(EMAIL_CONFIG.limits.delayBetweenEmails);
      
    } catch (error: any) {
      console.error(`❌ Erro ao enviar para ${email}:`, error.message);
      failed++;
      errors.push(`${email}: ${error.message}`);
    }
  }
  
  return { sent, failed, errors };
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verificar se o serviço está funcionando
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    const transport = ensureInitialized();
    await transport.verify();
    console.log('✅ Serviço de e-mail verificado e funcionando');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar serviço de e-mail:', error);
    return false;
  }
}

// Made with Bob - Sistema Boa Nova 📢