import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Event, SaturdayType } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventDetailsModalProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const getSaturdayTypeInfo = (type: SaturdayType) => {
  switch (type) {
    case SaturdayType.FIRST:
      return { color: '#9c27b0', label: '1º Sábado - Oração e Espiritualidade' };
    case SaturdayType.SECOND:
      return { color: '#ff9800', label: '2º Sábado - Grande Evento/Convivência' };
    case SaturdayType.THIRD:
      return { color: '#2196f3', label: '3º Sábado - Formação I - Doutrinário' };
    case SaturdayType.FOURTH:
      return { color: '#4caf50', label: '4º Sábado - Formação II - Aprofundamento' };
    default:
      return { color: '#757575', label: 'Tipo desconhecido' };
  }
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!event) return null;

  const saturdayTypeInfo = getSaturdayTypeInfo(event.saturdayType);
  const formattedDate = format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      onDelete(event.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: fullScreen ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Detalhes do Evento
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

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Título do Evento */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          {event.title}
        </Typography>

        {/* Tipo de Sábado */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={saturdayTypeInfo.label}
            sx={{
              backgroundColor: saturdayTypeInfo.color,
              color: 'white',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          />
          {event.isSpecialEvent && (
            <Chip
              label="Evento Especial"
              color="secondary"
              sx={{ ml: 1, fontWeight: 500 }}
            />
          )}
        </Box>

        {/* Data */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Data
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formattedDate}
            </Typography>
          </Box>
        </Box>

        {/* Horário */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimeIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Horário
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {event.startTime} - {event.endTime}
            </Typography>
          </Box>
        </Box>

        {/* Local */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Local
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {event.location}
            </Typography>
          </Box>
        </Box>

        {/* Participantes */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PeopleIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Participantes Confirmados
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {event.attendees.length} pessoa(s)
            </Typography>
          </Box>
        </Box>

        {/* Descrição */}
        {event.description && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Descrição
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {event.description}
            </Typography>
          </Box>
        )}

        {/* Notas */}
        {event.notes && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Observações
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {event.notes}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {canDelete && (
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
            variant="outlined"
          >
            Excluir
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
        {canEdit && (
          <Button
            onClick={() => onEdit(event)}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsModal;

