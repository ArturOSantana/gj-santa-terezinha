
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
import { Edit as EditIcon } from '@mui/icons-material';
import { User, UserRole } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserCardProps {
  user: User;
  onEditRole?: (user: User) => void;
  canEdit?: boolean;
  isCurrentUser?: boolean;
}

const roleConfig: Record<UserRole, { label: string; color: 'error' | 'warning' | 'info' }> = {
  admin: { label: 'Administrador', color: 'error' },
  coordinator: { label: 'Coordenador', color: 'warning' },
  member: { label: 'Membro', color: 'info' },
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onEditRole,
  canEdit = false,
  isCurrentUser = false,
}) => {
  const roleInfo = roleConfig[user.role];
  const initials = getInitials(user.displayName);

  const handleEditClick = () => {
    if (onEditRole && canEdit) {
      onEditRole(user);
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
            alt={user.displayName}
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
              {user.displayName}
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
              {user.email}
            </Typography>
          </Box>

          {/* Botão Editar Role */}
          {canEdit && !isCurrentUser && (
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
            {format(user.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Typography>
          {user.lastLogin && (
            <Typography variant="caption" color="text.secondary">
              <strong>Último acesso:</strong>{' '}
              {format(user.lastLogin, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;

