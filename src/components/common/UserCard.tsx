
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
        borderRadius: 3,
        bgcolor: '#f7efdd',
        color: '#2a1420',
        border: '1px solid rgba(211, 163, 76, 0.3)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.22)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2.5 }}>
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
              width: 52,
              height: 52,
              bgcolor: roleInfo.color === 'error' ? '#c15c71' : roleInfo.color === 'warning' ? '#d3a34c' : '#8c5a6d',
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: '#2a1420',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {safeName}
              </Typography>
              {isCurrentUser && (
                <Chip
                  label="Você"
                  size="small"
                  sx={{
                    bgcolor: '#c15c71',
                    color: '#ffffff',
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#6b5347',
                fontSize: '0.82rem',
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
              <Tooltip title="Editar Permissão">
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  sx={{
                    color: '#c15c71',
                    bgcolor: 'rgba(193, 92, 113, 0.1)',
                    '&:hover': {
                      bgcolor: '#c15c71',
                      color: '#ffffff',
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
                    color: '#c15c71',
                    bgcolor: 'rgba(193, 92, 113, 0.1)',
                    '&:hover': {
                      bgcolor: '#9a3450',
                      color: '#ffffff',
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
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: roleInfo.color === 'error' ? 'rgba(193, 92, 113, 0.15)' : roleInfo.color === 'warning' ? 'rgba(211, 163, 76, 0.2)' : 'rgba(140, 90, 109, 0.15)',
              color: roleInfo.color === 'error' ? '#9a3450' : roleInfo.color === 'warning' ? '#8a6116' : '#573040',
              border: '1px solid',
              borderColor: roleInfo.color === 'error' ? 'rgba(193, 92, 113, 0.3)' : roleInfo.color === 'warning' ? 'rgba(211, 163, 76, 0.35)' : 'rgba(140, 90, 109, 0.3)',
            }}
          />
        </Box>

        {/* Informações Adicionais */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 1, borderTop: '1px solid rgba(211, 163, 76, 0.15)' }}>
          <Typography variant="caption" sx={{ color: '#6b5347' }}>
            <strong style={{ color: '#2a1420' }}>Membro desde:</strong>{' '}
            {formatSafeDate(user.createdAt)}
          </Typography>
          {user.lastLogin && (
            <Typography variant="caption" sx={{ color: '#6b5347' }}>
              <strong style={{ color: '#2a1420' }}>Último acesso:</strong>{' '}
              {formatSafeDate(user.lastLogin, true)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;

