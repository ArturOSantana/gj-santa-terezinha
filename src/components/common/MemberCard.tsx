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
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import { Member, MemberStatus } from '../../types';
import { getMonth } from 'date-fns';

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

const isBirthdayMonth = (birthDate?: Date | null): boolean => {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return false;
  
  const today = new Date();
  return getMonth(birth) === getMonth(today);
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
  const theme = useTheme();
  const age = calculateAge(member.birthDate);
  const isBirthday = isBirthdayMonth(member.birthDate);
  const safeName = typeof member.name === 'string' && member.name.trim() ? member.name : 'Membro sem nome';
  const safeEmail = typeof member.email === 'string' && member.email.trim() ? member.email : 'Email não informado';
  const safePhone = typeof member.phone === 'string' && member.phone.trim() ? member.phone : 'Telefone não informado';
  const initials = getInitials(member.name);

  const genderColor = member.gender === 'male' ? theme.palette.primary.main : theme.palette.secondary.main;
  const genderLabel = member.gender === 'male' ? 'Cavalheiros' : 'Santa Joana';
  const GenderIcon = member.gender === 'male' ? MaleIcon : FemaleIcon;

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
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        maxWidth: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, transparent 0%, ${alpha(genderColor, 0.02)} 100%)`,
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      {isBirthday && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: theme.palette.warning.main,
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.4)}`,
          }}
        >
          <CakeIcon sx={{ fontSize: 18, color: 'white' }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pb: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative', mr: 2 }}>
            <Avatar
              src={member.photoUrl}
              alt={safeName}
              sx={{
                width: 80,
                height: 80,
                bgcolor: alpha(genderColor, 0.1),
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: genderColor,
                border: `3px solid ${genderColor}`,
                boxShadow: `0 4px 12px ${alpha(genderColor, 0.3)}`,
              }}
            >
              {!member.photoUrl && initials}
            </Avatar>
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%' }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'Merriweather, serif',
                mb: 0.5,
                maxWidth: '100%',
              }}
            >
              {safeName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<GenderIcon sx={{ fontSize: 14 }} />}
                label={genderLabel}
                size="small"
                sx={{
                  bgcolor: genderColor,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                }}
              />
              <Chip
                label={statusInfo.label}
                size="small"
                color={statusInfo.color as any}
                sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: alpha(genderColor, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CakeIcon sx={{ fontSize: 16, color: genderColor }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {age !== null ? `${age} anos` : 'Idade não informada'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: alpha(genderColor, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EmailIcon sx={{ fontSize: 16, color: genderColor }} />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
                maxWidth: '100%',
                wordBreak: 'break-all',
              }}
            >
              {safeEmail}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: alpha(genderColor, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneIcon sx={{ fontSize: 16, color: genderColor }} />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {safePhone}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: 'flex-end',
          pt: 0,
          px: 2,
          pb: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Tooltip title="Ver Detalhes" arrow>
          <IconButton
            size="small"
            onClick={() => onViewDetails(member)}
            aria-label="ver detalhes do membro"
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        {false && canEdit && (
          <Tooltip title="Editar" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(member)}
              aria-label="editar membro"
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {false && canDelete && (
          <Tooltip title="Excluir" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(member.id)}
              aria-label="excluir membro"
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
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

