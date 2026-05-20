import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';
import { Member, MemberStatus } from '../../types';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (memberId: string) => void;
  onViewDetails: (member: Member) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const calculateAge = (birthDate?: Date | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const getInitials = (name?: string | null): string => {
  const safeName = typeof name === 'string' ? name.trim() : '';
  if (!safeName) return '??';

  const parts = safeName.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return safeName.substring(0, 2).toUpperCase();
};

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onViewDetails,
  canEdit = true,
  canDelete = true,
}) => {
  const age = calculateAge(member.birthDate);
  const safeName = typeof member.name === 'string' && member.name.trim() ? member.name : 'Membro sem nome';
  const safeEmail = typeof member.email === 'string' && member.email.trim() ? member.email : 'Email não informado';
  const safePhone = typeof member.phone === 'string' && member.phone.trim() ? member.phone : 'Telefone não informado';
  const initials = getInitials(member.name);

  // Cores por gênero
  const genderColor = member.gender === 'male' ? '#2196f3' : member.gender === 'female' ? '#e91e63' : '#757575';
  const genderLabel = member.gender === 'male' ? 'Rapazes' : member.gender === 'female' ? 'Moças' : 'Não informado';

  // Cores por status
  const statusConfig = {
    [MemberStatus.ACTIVE]: { color: 'success', label: 'Ativo' },
    [MemberStatus.INACTIVE]: { color: 'default', label: 'Inativo' },
    [MemberStatus.SUSPENDED]: { color: 'error', label: 'Suspenso' },
  };

  const statusInfo = statusConfig[member.status];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Avatar e Nome */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={member.photoUrl}
            alt={safeName}
            sx={{
              width: 56,
              height: 56,
              bgcolor: genderColor,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              mr: 2,
            }}
          >
            {!member.photoUrl && initials}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {safeName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={genderLabel}
                size="small"
                sx={{
                  bgcolor: genderColor,
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                label={statusInfo.label}
                size="small"
                color={statusInfo.color as any}
                sx={{ fontWeight: 500, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Informações */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CakeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {age !== null ? `${age} anos` : 'Idade não informada'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {safePhone}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Ações */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 2, pb: 2 }}>
        <Tooltip title="Ver Detalhes" arrow>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onViewDetails(member)}
            aria-label="ver detalhes do membro"
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        {/* Botões de editar e deletar removidos - apenas visualização */}
        {false && canEdit && (
          <Tooltip title="Editar" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(member)}
              aria-label="editar membro"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {false && canDelete && (
          <Tooltip title="Excluir" arrow>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(member.id)}
              aria-label="excluir membro"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default MemberCard;

