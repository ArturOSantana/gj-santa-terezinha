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
} from '@mui/icons-material';
import { Event, EventCategory } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/constants';
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

const getCategoryInfo = (category: EventCategory) => {
  const categoryInfo = EVENT_CATEGORIES[category];
  return {
    color: categoryInfo?.color || '#757575',
    label: categoryInfo?.label || 'Evento',
  };
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

  const categoryInfo = getCategoryInfo(event.category);
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
          borderRadius: fullScreen ? 0 : 3,
          bgcolor: '#f7efdd',
          color: '#2a1420',
          border: '1px solid rgba(211, 163, 76, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
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
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontFamily: '"Fraunces", Georgia, serif', color: '#2a1420' }}>
          Detalhes do Evento
        </Typography>
        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="fechar"
          size="small"
          sx={{ color: '#6b5347' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(211, 163, 76, 0.2)' }} />

      <DialogContent sx={{ pt: 3 }}>
        {/* Título do Evento */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontFamily: '"Fraunces", Georgia, serif', color: '#2a1420', mb: 1.5 }}>
          {event.title}
        </Typography>

        {/* Categoria do Evento */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={categoryInfo.label}
            sx={{
              backgroundColor: categoryInfo.color,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          />
        </Box>

        {/* Data */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarIcon sx={{ mr: 1.5, color: '#c15c71' }} />
          <Box>
            <Typography variant="caption" sx={{ color: '#6b5347', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
              Data
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#2a1420', textTransform: 'capitalize' }}>
              {formattedDate}
            </Typography>
          </Box>
        </Box>

        {/* Horário */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TimeIcon sx={{ mr: 1.5, color: '#c15c71' }} />
          <Box>
            <Typography variant="caption" sx={{ color: '#6b5347', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
              Horário
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#2a1420' }}>
              {event.startTime} {event.endTime ? `às ${event.endTime}` : ''}
            </Typography>
          </Box>
        </Box>

        {/* Local */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon sx={{ mr: 1.5, color: '#c15c71' }} />
          <Box>
            <Typography variant="caption" sx={{ color: '#6b5347', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
              Local
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#2a1420' }}>
              {event.location}
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

      <Divider sx={{ borderColor: 'rgba(211, 163, 76, 0.2)' }} />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {canDelete && (
          <Button
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
            variant="outlined"
            sx={{ color: '#c15c71', borderColor: '#c15c71', '&:hover': { borderColor: '#9a3450' } }}
          >
            Excluir
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ color: '#2a1420' }}>
          Fechar
        </Button>
        {canEdit && (
          <Button
            onClick={() => onEdit(event)}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsModal;

