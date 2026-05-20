
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { User, UserRole } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserCardProps {
  user: User;
  onEditRole?: (user: User) => void;
  onDelete?: (user: User) => void;
  canEdit?: boolean;
  isCurrentUser?: boolean;
}

const roleConfig: Record<UserRole, { label: string; color: 'error' | 'warning' | 'info' }> = {
  admin: { label: 'Administrador', color: 'error' },
  coordinator: { label: 'Coordenador', color: 'warning' },
  member: { label: 'Membro', color: 'info' },
};

const getInitials = (name?: string | null): string => {
  const safeName = typeof name === 'string' ? name.trim() : '';
  if (!safeName) return '??';

  const parts = safeName.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatSafeDate = (value?: Date | null, withTime = false): string => {
  if (!value) return 'Não informado';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Não informado';
  return withTime
    ? format(parsed, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : format(parsed, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEditRole,
  onDelete,
  canEdit = false,
  isCurrentUser = false,
}) => {
  const roleInfo = roleConfig[user.role];
  const safeName = typeof user.name === 'string' && user.name.trim() ? user.name : 'Usuário sem nome';
  const safeEmail = typeof user.email === 'string' && user.email.trim() ? user.email : 'Email não informado';
  const initials = getInitials(user.name);

  const handleEditClick = () => {
    if (onEditRole && canEdit) {
      onEditRole(user);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && canEdit) {
      onDelete(user);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        {/* Avatar e Nome */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            gap: 2,
          }}
        >
          <Avatar
            src={user.photoUrl}
            alt={safeName}
            sx={{
              width: 56,
              height: 56,
              bgcolor: `${roleInfo.color}.main`,
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {safeName}
              {isCurrentUser && (
                <Chip
                  label="Você"
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {safeEmail}
            </Typography>
          </Box>

          {/* Botões de Ação */}
          {canEdit && !isCurrentUser && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Editar Role">
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Deletar Usuário">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'error.dark',
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Badge de Role */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={roleInfo.label}
            color={roleInfo.color}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Informações Adicionais */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Membro desde:</strong>{' '}
            {formatSafeDate(user.createdAt)}
          </Typography>
          {user.lastLogin && (
            <Typography variant="caption" color="text.secondary">
              <strong>Último acesso:</strong>{' '}
              {formatSafeDate(user.lastLogin, true)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;

