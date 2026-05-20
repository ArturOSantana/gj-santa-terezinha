import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Você precisa estar logado para acessar esta página.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '2px solid #1e1e1e' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Meu Perfil
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              disabled={!editing || loading}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editing || loading}
              helperText={editing ? "Alterar o email requer confirmação com senha" : ""}
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
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={handleEdit}
                >
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </>
              )}
            </Box>
          </Box>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
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
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmEmailChange} variant="contained">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

