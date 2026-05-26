import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Send,
  Image as ImageIcon,
  Close,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useBoaNova } from '../../../hooks/useBoaNova';

export const EmailBroadcast: React.FC = () => {
  const {
    loading,
    error,
    sendEmail,
    uploadImage,
    loadContacts,
    contacts,
    validateContacts,
    verifyEmailService,
  } = useBoaNova();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipientsInput, setRecipientsInput] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{ verified: boolean; message: string } | null>(null);

  const handleVerifyService = async () => {
    try {
      const result = await verifyEmailService();
      setServiceStatus({ verified: result.success, message: result.message });
    } catch (err) {
      console.error('Erro ao verificar serviço:', err);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleLoadMembers = async () => {
    await loadContacts('email');
    const emails = contacts.map(c => c.email).filter(Boolean) as string[];
    setSelectedRecipients(emails);
    setRecipientsInput(emails.join('\n'));
  };

  const handleValidateRecipients = () => {
    const emails = recipientsInput.split('\n').filter(line => line.trim());
    const { valid, invalid } = validateContacts(emails, 'email');
    
    if (invalid.length > 0) {
      alert(`${invalid.length} e-mails inválidos encontrados:\n${invalid.join('\n')}`);
    }
    
    setSelectedRecipients(valid);
  };

  const handleSend = async () => {
    if (selectedRecipients.length === 0 || !subject.trim() || !message.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      let imageUrl: string | undefined;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const result = await sendEmail(
        selectedRecipients,
        subject,
        message,
        imageUrl
      );

      setSendResult({ sent: result.sent, failed: result.failed });
    } catch (err) {
      console.error('Erro ao enviar:', err);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessage('');
    setImageFile(null);
    setImagePreview(null);
    setRecipientsInput('');
    setSelectedRecipients([]);
    setSendResult(null);
  };

  if (sendResult) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {sendResult.failed === 0 ? (
          <>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              E-mails Enviados com Sucesso!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {sendResult.sent} e-mail(s) enviado(s)
            </Typography>
          </>
        ) : (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Envio Concluído com Avisos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Enviados: {sendResult.sent}
            </Typography>
            <Typography variant="body1" color="error" sx={{ mb: 3 }}>
              Falhas: {sendResult.failed}
            </Typography>
          </>
        )}
        
        <Button variant="contained" onClick={handleReset}>
          Novo Envio
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Verificar Serviço de E-mail
          </Typography>
          <Button
            variant="outlined"
            onClick={handleVerifyService}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Testar Configuração
          </Button>
          {serviceStatus && (
            <Alert severity={serviceStatus.verified ? 'success' : 'error'}>
              {serviceStatus.message}
            </Alert>
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          Destinatários
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Digite um e-mail por linha. Ex: email@exemplo.com
        </Alert>
        
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMembers}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Carregar Membros com Consentimento
          </Button>
          <Button
            variant="outlined"
            onClick={handleValidateRecipients}
            disabled={loading}
          >
            Validar E-mails
          </Button>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          value={recipientsInput}
          onChange={(e) => setRecipientsInput(e.target.value)}
          placeholder="email1@exemplo.com&#10;email2@exemplo.com&#10;..."
          sx={{ mb: 2 }}
        />

        <Chip
          label={`${selectedRecipients.length} destinatário(s) válido(s)`}
          color={selectedRecipients.length > 0 ? 'success' : 'default'}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" gutterBottom>
          Assunto
        </Typography>
        <TextField
          fullWidth
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Assunto do e-mail"
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" gutterBottom>
          Mensagem
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem aqui..."
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="email-image-upload"
            type="file"
            onChange={handleImageSelect}
          />
          <label htmlFor="email-image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<ImageIcon />}
            >
              Adicionar Imagem
            </Button>
          </label>
        </Box>

        {imagePreview && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">Imagem Anexada</Typography>
                <IconButton size="small" onClick={handleRemoveImage}>
                  <Close />
                </IconButton>
              </Box>
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Configurações de envio:</strong><br />
            • Delay entre e-mails: 1 segundo<br />
            • Lote: 50 e-mails<br />
            • Limite diário: 500 e-mails (Gmail SMTP gratuito)<br />
            • Total de destinatários: {selectedRecipients.length}
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={!subject.trim() || !message.trim() || selectedRecipients.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Enviando...' : 'Enviar E-mails'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

