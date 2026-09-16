import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as CoordinatorIcon,
  Person as MemberIcon,
} from '@mui/icons-material';
import { UserRole } from '../../types';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
}

const roleOptions: Array<{
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: 'error' | 'warning' | 'info';
}> = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acesso total ao sistema e gerenciamento de usuários',
    icon: <AdminIcon />,
    color: 'error',
  },
  {
    value: 'coordinator',
    label: 'Editor / Coordenador',
    description: 'Pode gerenciar eventos, escalas, atas e membros',
    icon: <CoordinatorIcon />,
    color: 'warning',
  },
  {
    value: 'member',
    label: 'Visualizador / Membro',
    description: 'Acesso para visualizar eventos, presenças e calendário',
    icon: <MemberIcon />,
    color: 'info',
  },
];

export const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onAddUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('member');
    setShowPassword(false);
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAddUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Erro ao criar usuário';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#f7efdd',
          color: '#2a1420',
          borderRadius: 3,
          border: '1px solid rgba(211, 163, 76, 0.3)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 700,
            borderBottom: '1px solid rgba(211, 163, 76, 0.2)',
          }}
        >
          Adicionar Novo Usuário
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(211, 163, 76, 0.2)' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <TextField
              label="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="Ex: Maria da Silva"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              placeholder="exemplo@email.com"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Senha Inicial"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Mínimo de 6 caracteres. O usuário poderá alterá-la depois."
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                },
              }}
            />

            <FormControl component="fieldset" fullWidth>
              <FormLabel
                component="legend"
                sx={{
                  mb: 1.5,
                  fontWeight: 700,
                  color: '#2a1420',
                  '&.Mui-focused': { color: '#c15c71' },
                }}
              >
                Perfil / Nível de Acesso
              </FormLabel>
              <RadioGroup
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                {roleOptions.map((opt) => (
                  <Box
                    key={opt.value}
                    sx={{
                      mb: 1.5,
                      p: 1.5,
                      border: '1px solid',
                      borderColor:
                        role === opt.value
                          ? `${opt.color}.main`
                          : 'rgba(211, 163, 76, 0.3)',
                      borderRadius: 2,
                      bgcolor:
                        role === opt.value
                          ? 'rgba(193, 92, 113, 0.08)'
                          : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <FormControlLabel
                      value={opt.value}
                      control={
                        <Radio
                          sx={{
                            color: '#6b5347',
                            '&.Mui-checked': { color: `${opt.color}.main` },
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                          }}
                        >
                          <Box sx={{ color: `${opt.color}.main`, mt: 0.5 }}>
                            {opt.icon}
                          </Box>
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 700, color: '#2a1420' }}
                            >
                              {opt.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: '#6b5347' }}
                            >
                              {opt.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: '#4a3227' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              minWidth: 120,
              bgcolor: '#c15c71',
              color: '#ffffff',
              fontWeight: 700,
              '&:hover': { bgcolor: '#9a3450' },
            }}
          >
            {loading ? 'Criando...' : 'Adicionar Usuário'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUserModal;
