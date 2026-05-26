import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../../utils/validation';
import brasaoGJ from '../../assets/brasao-gj.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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
        background: 'linear-gradient(135deg, #f8f4ec 0%, #ece3d3 52%, #dfd3bf 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${brasaoGJ})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: { xs: '280px', sm: '360px', md: '420px' },
          opacity: 0.035,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 12% 18%, rgba(26, 71, 49, 0.08) 0, transparent 22%), radial-gradient(circle at 86% 76%, rgba(184, 134, 11, 0.12) 0, transparent 20%), linear-gradient(to right, rgba(30,30,30,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,30,30,0.04) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 28px 28px, 28px 28px',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 470,
            ml: { md: 2 },
            mr: 'auto',
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            borderRadius: { xs: 3, md: 4 },
            border: '1px solid rgba(26, 71, 49, 0.12)',
            bgcolor: 'rgba(252, 249, 243, 0.94)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 18px 44px rgba(26, 71, 49, 0.12)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -42,
              right: -28,
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: 'rgba(26, 71, 49, 0.07)',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3.5 } }}>
              <Box
                component="img"
                src={brasaoGJ}
                alt="Brasão GJ"
                sx={{
                  width: { xs: 80, sm: 96, md: 106 },
                  height: { xs: 80, sm: 96, md: 106 },
                  mb: { xs: 1.5, sm: 2 },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 18px rgba(26, 71, 49, 0.18))',
                }}
              />

              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: 'Merriweather, serif',
                  color: 'primary.main',
                  mb: 0.75,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                }}
              >
                Guarda de Jericó
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Santa Terezinha • acesso ao sistema
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  mb: 2.5,
                  borderRadius: 2.5,
                }}
              >
                {error}
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
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.72)',
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.72)',
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3.5,
                  mb: 2.5,
                  py: 1.5,
                  borderRadius: 2.75,
                  background: 'linear-gradient(135deg, #1a4731 0%, #2d6b4a 100%)',
                  boxShadow: '0 12px 28px rgba(26, 71, 49, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #143726 0%, #24553d 100%)',
                  },
                }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Esqueceu a senha?
                </Link>

                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  sx={{ fontWeight: 700 }}
                >
                  Criar conta
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

