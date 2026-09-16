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

  const rawFrom = (location.state as any)?.from?.pathname || '/admin';
  // Prevenir open redirect: aceitar apenas paths internos (começa com '/' e não contém '://')
  const from = typeof rawFrom === 'string' && rawFrom.startsWith('/') && !rawFrom.includes('://')
    ? (rawFrom === '/' ? '/admin' : rawFrom)
    : '/admin';

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
        background: '#f8f4ec',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: '1px solid rgba(26, 71, 49, 0.12)',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            position: 'relative',
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
                Grupo de Jovens Santa Terezinha
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
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2,
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
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

