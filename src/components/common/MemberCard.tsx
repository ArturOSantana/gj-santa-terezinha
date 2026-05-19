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

/**
 * Props do componente MemberCard
 */
interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (memberId: string) => void;
  onViewDetails: (member: Member) => void;
}

/**
 * Calcula a idade a partir da data de nascimento
 */
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Gera as iniciais do nome
 */
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Componente MemberCard
 * Exibe informações resumidas de um membro em formato de card
 */
const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const age = calculateAge(member.birthDate);
  const initials = getInitials(member.name);

  // Cores por gênero
  const genderColor = member.gender === 'male' ? '#2196f3' : '#e91e63';
  const genderLabel = member.gender === 'male' ? 'Rapazes' : 'Moças';

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
            alt={member.name}
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
              {member.name}
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
              {age} anos
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
              {member.email}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {member.phone}
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
      </CardActions>
    </Card>
  );
};

export default MemberCard;

// Made with Bob