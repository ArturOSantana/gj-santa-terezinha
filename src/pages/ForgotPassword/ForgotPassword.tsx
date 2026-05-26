
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
import { LockReset as LockResetIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #faf8f3 0%, #ece5d8 55%, #e0d6c6 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${brasaoGJ})`,
          backgroundSize: { xs: '280px', md: '400px' },
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 15% 18%, rgba(26, 71, 49, 0.08) 0, transparent 20%), radial-gradient(circle at 84% 76%, rgba(184, 134, 11, 0.10) 0, transparent 18%)',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 450,
            mx: 'auto',
            width: '100%',
            p: { xs: 2.5, sm: 3.5, md: 4 },
            borderRadius: { xs: 3, md: 4 },
            border: '1px solid rgba(26, 71, 49, 0.10)',
            bgcolor: 'rgba(252, 249, 243, 0.94)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 16px 38px rgba(26, 71, 49, 0.14)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -36,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(26, 71, 49, 0.06)',
            },
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
                  mt: 3.25,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2.75,
                  background: 'linear-gradient(135deg, #1a4731 0%, #2d6b4a 100%)',
                  boxShadow: '0 12px 28px rgba(26, 71, 49, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #143726 0%, #24553d 100%)',
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

