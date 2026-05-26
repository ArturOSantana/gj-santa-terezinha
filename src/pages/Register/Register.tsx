
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  isValidEmail,
  isValidPassword,
  getPasswordErrorMessage,
  isValidName,
  isValidPhone,
  formatPhone,
  isValidBirthDate,
} from '../../utils/validation';
import brasaoGJ from '../../assets/brasao-gj.png';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '' as 'male' | 'female' | '',
    password: '',
    confirmPassword: '',
    whatsappConsent: true,  // Marcado por padrão
    emailConsent: true,     // Marcado por padrão
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.name || !formData.email || !formData.phone || !formData.birthDate || !formData.gender || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!isValidName(formData.name)) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError('Telefone inválido. Use o formato: (11) 99999-9999');
      return;
    }

    if (!isValidBirthDate(formData.birthDate)) {
      setError('Data de nascimento inválida. Idade mínima: 12 anos');
      return;
    }

    if (!formData.gender) {
      setError('Por favor, selecione o gênero');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError(getPasswordErrorMessage(formData.password));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        new Date(formData.birthDate),
        formData.gender,
        formData.whatsappConsent,
        formData.emailConsent
      );
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
        background: 'linear-gradient(135deg, #efe7d8 0%, #e4d7bf 50%, #d9c7aa 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${brasaoGJ})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: { xs: '300px', sm: '380px', md: '460px' },
          opacity: 0.03,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 18% 16%, rgba(26,71,49,0.08) 0, transparent 22%), radial-gradient(circle at 82% 72%, rgba(184,134,11,0.12) 0, transparent 18%), linear-gradient(to right, rgba(30,30,30,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,30,30,0.035) 1px, transparent 1px)',
          backgroundSize: 'auto, auto, 30px 30px, 30px 30px',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5, md: 4.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: { xs: 3, md: 4 },
            maxWidth: 520,
            mr: { md: 2 },
            ml: 'auto',
            bgcolor: 'rgba(253, 249, 242, 0.95)',
            border: '1px solid rgba(122, 75, 31, 0.14)',
            boxShadow: '0 20px 48px rgba(122, 75, 31, 0.12)',
            backdropFilter: 'blur(14px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -34,
              bottom: -42,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(184, 134, 11, 0.08)',
            },
          }}
        >
          <Box sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 3.25 } }}>
              <Box
                component="img"
                src={brasaoGJ}
                alt="Brasão GJ"
                sx={{
                  width: { xs: 80, sm: 96, md: 104 },
                  height: { xs: 80, sm: 96, md: 104 },
                  mb: { xs: 1.5, sm: 2 },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 18px rgba(122, 75, 31, 0.18))',
                }}
              />
              
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Merriweather, serif',
                  color: '#7a4b1f',
                  mb: 0.75,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                }}
              >
                Criar Conta
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                Grupo de Jovens • Paróquia Santa Terezinha
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: 2.5 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Nome Completo"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.74)',
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.74)',
                  },
                }}
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1.05fr 0.95fr' },
                  gap: 1.5,
                  mt: 1,
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Telefone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: formatPhone(e.target.value),
                    })
                  }
                  disabled={loading}
                  helperText="Formato: (11) 99999-9999"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255,255,255,0.74)',
                    },
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="birthDate"
                  label="Data de Nascimento"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={loading}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  helperText="Idade mínima: 12 anos"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255,255,255,0.74)',
                    },
                  }}
                />
              </Box>

              <FormControl fullWidth margin="normal" required sx={{ mt: 2 }}>
                <InputLabel id="gender-label">Gênero</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                  disabled={loading}
                  label="Gênero"
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.74)',
                  }}
                >
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Feminino</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                  mt: 1,
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255,255,255,0.74)',
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

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'rgba(255,255,255,0.74)',
                    },
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Seção de Consentimento - Boa Nova */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  bgcolor: 'rgba(26, 71, 49, 0.04)',
                  borderRadius: 2.5,
                  border: '1px solid rgba(26, 71, 49, 0.12)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  📢 Comunicação do GJ
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, fontSize: '0.875rem' }}
                >
                  Para manter você informado sobre eventos, reuniões e atividades:
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.whatsappConsent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappConsent: e.target.checked,
                        })
                      }
                      disabled={loading}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      Aceito receber mensagens via <strong>WhatsApp</strong>
                    </Typography>
                  }
                  sx={{ mb: 1 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.emailConsent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailConsent: e.target.checked,
                        })
                      }
                      disabled={loading}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      Aceito receber mensagens via <strong>E-mail</strong>
                    </Typography>
                  }
                />

                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  sx={{ mt: 1.5, fontSize: '0.75rem', fontStyle: 'italic' }}
                >
                  💡 Você pode alterar essas preferências a qualquer momento no seu perfil.
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3.5,
                  mb: 2.25,
                  py: 1.5,
                  borderRadius: 2.75,
                  background: 'linear-gradient(135deg, #7a4b1f 0%, #b8860b 100%)',
                  boxShadow: '0 12px 28px rgba(122, 75, 31, 0.18)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #633b17 0%, #9c7107 100%)',
                  },
                }}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ fontWeight: 700 }}
                >
                  Já tem uma conta? Faça login
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

