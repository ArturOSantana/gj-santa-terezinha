import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidBirthDate,
  formatPhone,
} from '../../utils/validation';
import { PageHeader } from '../../components/common';

const darkFieldSx = {
  '& .MuiInputBase-input': { color: '#f4e6e9' },
  '& .MuiInputBase-input.Mui-disabled': { color: '#e2cad2', WebkitTextFillColor: '#e2cad2' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'rgba(211, 163, 76, 0.25)' },
    '&:hover fieldset': { borderColor: 'rgba(211, 163, 76, 0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#d3a34c' },
    '&.Mui-disabled fieldset': { borderColor: 'rgba(211, 163, 76, 0.15)' },
  },
  '& .MuiInputLabel-root': { color: '#b09aa5' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#d3a34c' },
  '& .MuiInputLabel-root.Mui-disabled': { color: '#8a7080' },
  '& .MuiFormHelperText-root': { color: '#b09aa5' },
};

const sectionCardSx = {
  height: '100%',
  p: { xs: 2, md: 2.75 },
  borderRadius: { xs: 3, md: 3.5 },
  border: '1px solid rgba(211, 163, 76, 0.18)',
  background: 'rgba(47, 21, 34, 0.7)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
};

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [passwordForEmailChange, setPasswordForEmailChange] = useState('');

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
  });

  const [originalData, setOriginalData] = useState(formData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'phone' ? formatPhone(value) : value,
    });
  };

  const handleEdit = () => {
    setOriginalData(formData);
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formData.displayName || !formData.email || !formData.phone || !formData.birthDate) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!isValidName(formData.displayName)) {
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

    if (formData.email !== originalData.email) {
      setConfirmDialogOpen(true);
      return;
    }

    await saveChanges();
  };

  const saveChanges = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        birthDate: new Date(formData.birthDate),
      });

      setSuccess('Perfil atualizado com sucesso!');
      setEditing(false);
      setOriginalData(formData);
      setConfirmDialogOpen(false);
      setPasswordForEmailChange('');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    if (!passwordForEmailChange) {
      setError('Por favor, digite sua senha para confirmar a alteração do email');
      return;
    }

    await saveChanges();
  };

  if (!user) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">
          Você precisa estar logado para acessar esta página.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Meu Perfil"
        action={
          !editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                borderRadius: 2.75,
                px: 2.5,
              }}
            >
              Editar Perfil
            </Button>
          ) : undefined
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: { xs: 3, md: 4 },
          border: '1px solid rgba(211, 163, 76, 0.18)',
          background: 'rgba(47, 21, 34, 0.7)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: -35,
            bottom: -35,
            width: 170,
            height: 170,
            backgroundImage: 'url(/src/assets/brasao-gj.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: 0.04,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2.5, md: 3 },
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 88, md: 108 },
              height: { xs: 88, md: 108 },
              border: '3px solid',
              borderColor: 'secondary.main',
              boxShadow: '0 6px 18px rgba(184, 134, 11, 0.28)',
              bgcolor: 'primary.main',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
            src={user.photoURL || undefined}
          >
            <PersonIcon sx={{ fontSize: { xs: 40, md: 48 } }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Merriweather, serif',
                color: '#f4e6e9',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              {formData.displayName || 'Usuário'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#e2cad2', mt: 0.75, mb: 1.5 }}>
              {formData.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Perfil ${user.role === 'admin' ? 'Administrador' : user.role === 'coordinator' ? 'Coordenador' : 'Membro'}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={editing ? 'Modo de edição ativo' : 'Dados sincronizados'}
                color={editing ? 'secondary' : 'success'}
                variant="filled"
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box component="form">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={sectionCardSx}>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Merriweather, serif',
                      color: '#c15c71',
                      fontWeight: 700,
                      mb: 0.75,
                    }}
                  >
                    Dados Pessoais
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e2cad2' }}>
                    Atualize as informações principais do seu cadastro.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  sx={darkFieldSx}
                />

                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  sx={darkFieldSx}
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={sectionCardSx}>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Merriweather, serif',
                      color: '#c15c71',
                      fontWeight: 700,
                      mb: 0.75,
                    }}
                  >
                    Contato
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#e2cad2' }}>
                    Mantenha seus canais de comunicação sempre atualizados.
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  helperText={editing ? 'Alterar o email requer confirmação com senha' : ''}
                  slotProps={{
                    input: {
                      startAdornment: <EmailIcon sx={{ color: '#e2cad2', mr: 1 }} />,
                    },
                  }}
                  sx={darkFieldSx}
                />

                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing || loading}
                  helperText="Formato: (11) 99999-9999"
                  slotProps={{
                    input: {
                      startAdornment: <PhoneIcon sx={{ color: '#e2cad2', mr: 1 }} />,
                    },
                  }}
                  sx={darkFieldSx}
                />
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={sectionCardSx}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 3 },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', mb: 1 }}>
                    <SecurityIcon color="primary" />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Merriweather, serif',
                        color: '#c15c71',
                        fontWeight: 700,
                      }}
                    >
                      Segurança
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#e2cad2' }}>
                    Revise seus dados antes de salvar. Alterações no email exigem confirmação adicional.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: { xs: '100%', md: 'auto' },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                  }}
                >
                  {editing ? (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{
                          borderRadius: 2.75,
                          width: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          borderRadius: 2.75,
                          width: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Chip icon={<CakeIcon sx={{ color: '#d3a34c !important' }} />} label="Dados pessoais protegidos" variant="outlined" sx={{ color: '#e2cad2', borderColor: 'rgba(211,163,76,0.35)' }} />
                      <Chip icon={<EmailIcon sx={{ color: '#d3a34c !important' }} />} label="Email verificado manualmente" variant="outlined" sx={{ color: '#e2cad2', borderColor: 'rgba(211,163,76,0.35)' }} />
                      <Chip icon={<PhoneIcon sx={{ color: '#d3a34c !important' }} />} label="Contato em dia" variant="outlined" sx={{ color: '#e2cad2', borderColor: 'rgba(211,163,76,0.35)' }} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Confirmar Alteração de Email</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Para alterar seu email, por favor confirme sua senha atual.
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              label="Senha Atual"
              type="password"
              value={passwordForEmailChange}
              onChange={(e) => setPasswordForEmailChange(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmEmailChange} variant="contained">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

