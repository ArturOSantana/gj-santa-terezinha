
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as CoordinatorIcon,
  Person as MemberIcon,
} from '@mui/icons-material';
import { User, UserRole } from '../../types';

interface UserRoleModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, newRole: UserRole) => Promise<void>;
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
    description: 'Acesso total ao sistema, pode gerenciar usuários e todas as funcionalidades',
    icon: <AdminIcon />,
    color: 'error',
  },
  {
    value: 'coordinator',
    label: 'Coordenador',
    description: 'Pode gerenciar eventos, membros e finanças, mas não pode alterar usuários',
    icon: <CoordinatorIcon />,
    color: 'warning',
  },
  {
    value: 'member',
    label: 'Membro',
    description: 'Acesso básico para visualizar eventos e calendário',
    icon: <MemberIcon />,
    color: 'info',
  },
];

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  open,
  user,
  onClose,
  onSave,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar role selecionada quando o usuário mudar
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(event.target.value as UserRole);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validação: role não mudou
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(user.id, selectedRole);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar role';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!user) return null;

  const currentRoleInfo = roleOptions.find((r) => r.value === user.role);
  const hasChanges = selectedRole !== user.role;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            Editar Role de Usuário
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Informações do Usuário */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Usuário
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {user.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`Role atual: ${currentRoleInfo?.label}`}
              color={currentRoleInfo?.color}
              size="small"
            />
          </Box>
        </Box>

        {/* Seleção de Role */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
            Selecione o novo role
          </FormLabel>
          <RadioGroup value={selectedRole} onChange={handleRoleChange}>
            {roleOptions.map((option) => (
              <Box
                key={option.value}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: selectedRole === option.value ? `${option.color}.main` : 'divider',
                  borderRadius: 1,
                  bgcolor: selectedRole === option.value ? `${option.color}.lighter` : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: `${option.color}.main`,
                    bgcolor: `${option.color}.lighter`,
                  },
                }}
              >
                <FormControlLabel
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ color: `${option.color}.main`, mt: 0.5 }}>
                        {option.icon}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {option.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
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

        {/* Mensagem de Erro */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Aviso de Confirmação */}
        {hasChanges && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Esta ação alterará as permissões do usuário no sistema.
              Certifique-se de que está fazendo a alteração correta.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !hasChanges}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserRoleModal;

