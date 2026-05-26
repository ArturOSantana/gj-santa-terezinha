import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QrCode2,
  Send,
  Close,
  Image as ImageIcon,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useBoaNova } from '../../../hooks/useBoaNova';

const steps = ['Conectar WhatsApp', 'Selecionar Destinatários', 'Compor Mensagem', 'Enviar'];

export const WhatsAppBroadcast: React.FC = () => {
  const {
    whatsappSession,
    loading,
    error,
    startWhatsAppSession,
    checkWhatsAppSession,
    endWhatsAppSession,
    sendWhatsApp,
    uploadImage,
    loadContacts,
    contacts,
    validateContacts,
  } = useBoaNova();

  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipientsInput, setRecipientsInput] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  // Polling para verificar status da sessão
  useEffect(() => {
    if (whatsappSession.sessionId && whatsappSession.status === 'qr_pending') {
      const interval = setInterval(async () => {
        await checkWhatsAppSession(whatsappSession.sessionId!);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [whatsappSession.sessionId, whatsappSession.status, checkWhatsAppSession]);

  // Avançar automaticamente quando conectado
  useEffect(() => {
    if (whatsappSession.status === 'connected' && activeStep === 0) {
      setActiveStep(1);
    }
  }, [whatsappSession.status, activeStep]);

  const handleStartSession = async () => {
    try {
      await startWhatsAppSession();
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err);
    }
  };

  const handleEndSession = async () => {
    if (whatsappSession.sessionId) {
      try {
        await endWhatsAppSession(whatsappSession.sessionId);
        setActiveStep(0);
        setSendResult(null);
      } catch (err) {
        console.error('Erro ao encerrar sessão:', err);
      }
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
    await loadContacts('whatsapp');
    const phones = contacts.map(c => c.phoneNumber).filter(Boolean) as string[];
    setSelectedRecipients(phones);
    setRecipientsInput(phones.join('\n'));
  };

  const handleValidateRecipients = () => {
    const phones = recipientsInput.split('\n').filter(line => line.trim());
    const { valid, invalid } = validateContacts(phones, 'whatsapp');
    
    if (invalid.length > 0) {
      alert(`${invalid.length} números inválidos encontrados:\n${invalid.join('\n')}`);
    }
    
    setSelectedRecipients(valid);
  };

  const handleSend = async () => {
    if (!whatsappSession.sessionId || selectedRecipients.length === 0 || !message.trim()) {
      return;
    }

    try {
      let imageUrl: string | undefined;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const result = await sendWhatsApp(
        whatsappSession.sessionId,
        selectedRecipients,
        message,
        imageUrl,
        {
          delayMin: 3,
          delayMax: 8,
          batchSize: 20,
          batchDelay: 5,
        }
      );

      setSendResult({ sent: result.sent, failed: result.failed });
      setActiveStep(3);
    } catch (err) {
      console.error('Erro ao enviar:', err);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setMessage('');
    setImageFile(null);
    setImagePreview(null);
    setRecipientsInput('');
    setSelectedRecipients([]);
    setSendResult(null);
    handleEndSession();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {!whatsappSession.sessionId ? (
              <Box textAlign="center" py={4}>
                <QrCode2 sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Conectar WhatsApp
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Escaneie o QR Code com seu WhatsApp para iniciar uma sessão temporária
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartSession}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <QrCode2 />}
                >
                  {loading ? 'Gerando QR Code...' : 'Gerar QR Code'}
                </Button>
              </Box>
            ) : whatsappSession.status === 'qr_pending' ? (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" gutterBottom>
                  Escaneie o QR Code
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Abra o WhatsApp no seu celular → Configurações → Aparelhos conectados → Conectar um aparelho
                </Typography>
                {whatsappSession.qrCode && (
                  <Box
                    component="img"
                    src={whatsappSession.qrCode}
                    alt="QR Code WhatsApp"
                    sx={{
                      maxWidth: 300,
                      width: '100%',
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 2,
                    }}
                  />
                )}
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Aguardando conexão...
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleEndSession}
                  sx={{ mt: 2 }}
                  startIcon={<Close />}
                >
                  Cancelar
                </Button>
              </Box>
            ) : whatsappSession.status === 'connected' ? (
              <Box textAlign="center" py={4}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  WhatsApp Conectado!
                </Typography>
                <Chip
                  label={whatsappSession.phoneNumber || 'Conectado'}
                  color="success"
                  sx={{ mb: 3 }}
                />
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Sua sessão está ativa. Você pode prosseguir para selecionar os destinatários.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                >
                  Continuar
                </Button>
              </Box>
            ) : null}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecionar Destinatários
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Digite um número por linha (apenas números, 10-11 dígitos). Ex: 11999999999
            </Alert>
            
            <Box mb={2}>
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
                Validar Números
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={10}
              value={recipientsInput}
              onChange={(e) => setRecipientsInput(e.target.value)}
              placeholder="11999999999&#10;11888888888&#10;..."
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" color="text.secondary">
              {selectedRecipients.length} destinatário(s) válido(s)
            </Typography>

            <Box mt={3} display="flex" gap={2}>
              <Button onClick={() => setActiveStep(0)}>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleValidateRecipients();
                  setActiveStep(2);
                }}
                disabled={selectedRecipients.length === 0}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Compor Mensagem
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              sx={{ mb: 2 }}
            />

            <Box mb={2}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageSelect}
              />
              <label htmlFor="image-upload">
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
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
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

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Configurações de envio:</strong><br />
                • Delay entre mensagens: 3-8 segundos (aleatório)<br />
                • Lote: 20 mensagens<br />
                • Pausa entre lotes: 5 minutos<br />
                • Total de destinatários: {selectedRecipients.length}
              </Typography>
            </Alert>

            <Box display="flex" gap={2}>
              <Button onClick={() => setActiveStep(1)}>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!message.trim() || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                {loading ? 'Enviando...' : 'Enviar Mensagens'}
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box textAlign="center" py={4}>
            {sendResult && sendResult.failed === 0 ? (
              <>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Mensagens Enviadas com Sucesso!
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  {sendResult.sent} mensagem(ns) enviada(s)
                </Typography>
              </>
            ) : (
              <>
                <ErrorIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Envio Concluído com Avisos
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={1}>
                  Enviadas: {sendResult?.sent || 0}
                </Typography>
                <Typography variant="body1" color="error" mb={3}>
                  Falhas: {sendResult?.failed || 0}
                </Typography>
              </>
            )}
            
            <Button
              variant="contained"
              onClick={handleReset}
            >
              Novo Envio
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </Paper>

      {whatsappSession.sessionId && activeStep < 3 && (
        <Alert severity="info">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">
              Sessão ativa: {whatsappSession.phoneNumber || 'Conectado'}
            </Typography>
            <Button
              size="small"
              onClick={handleEndSession}
              startIcon={<Close />}
            >
              Encerrar Sessão
            </Button>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

