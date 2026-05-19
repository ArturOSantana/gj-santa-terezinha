import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Member, MemberStatus } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MemberDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: (member: Member) => void;
  member: Member | null;
  canEdit?: boolean;
}

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

const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  open,
  onClose,
  onEdit,
  member,
  canEdit = true,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!member) return null;

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="member-details-dialog-title"
    >
      <DialogTitle
        id="member-details-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Typography variant="h6" component="span">
          Detalhes do Membro
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="fechar"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Avatar e Informações Principais */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={member.photoUrl}
            alt={member.name}
            sx={{
              width: 100,
              height: 100,
              bgcolor: genderColor,
              fontSize: '2rem',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            {!member.photoUrl && initials}
          </Avatar>
          
          <Typography variant="h5" component="h2" gutterBottom align="center">
            {member.name}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              label={genderLabel}
              size="small"
              sx={{
                bgcolor: genderColor,
                color: 'white',
                fontWeight: 500,
              }}
            />
            <Chip
              label={statusInfo.label}
              size="small"
              color={statusInfo.color as any}
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Informações de Contato */}
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Informações de Contato
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <EmailIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Email"
              secondary={member.email}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Telefone"
              secondary={member.phone}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Informações Pessoais */}
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Informações Pessoais
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CakeIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Data de Nascimento"
              secondary={`${format(member.birthDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} (${age} anos)`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CalendarIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Membro desde"
              secondary={format(member.joinDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PersonIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Gênero"
              secondary={genderLabel}
            />
          </ListItem>
        </List>

        {/* Observações */}
        {member.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Observações
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {member.notes}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
        {canEdit && (
          <Button
            onClick={() => {
              onEdit(member);
              onClose();
            }}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberDetailsModal;

