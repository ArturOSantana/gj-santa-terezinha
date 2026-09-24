
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../../utils/validation';
import brasaoGJ from '../../assets/brasao-gj.png';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Por favor, informe seu email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        position: 'relative',
        background: '#f8f4ec',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 450,
            mx: 'auto',
            width: '100%',
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: '1px solid rgba(26, 71, 49, 0.10)',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3 } }}>
              <Box
                component="img"
                src={brasaoGJ}
                alt="Brasão GJ"
                sx={{
                  width: { xs: 76, sm: 90, md: 100 },
                  height: { xs: 76, sm: 90, md: 100 },
                  mb: 2,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 18px rgba(26, 71, 49, 0.16))',
                }}
              />

              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Merriweather, serif',
                  color: 'primary.main',
                  mb: 0.75,
                  fontSize: { xs: '1.45rem', sm: '1.75rem', md: '1.9rem' },
                }}
              >
                Recuperar Senha
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: 320,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Informe seu email e enviaremos as instruções para redefinir o acesso à sua conta.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: 2.5 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2.5, borderRadius: 2.5 }}>
                Email de recuperação enviado! Verifique sua caixa de entrada.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.72)',
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: '#1a4731',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#143726',
                    boxShadow: 'none',
                  },
                }}
                disabled={loading || success}
              >
                {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 18 }} />
                  Voltar para o login
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

