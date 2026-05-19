import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Event, SaturdayType } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente EventCard - Card de Evento
 * Exibe informações de um evento com badge colorido por tipo de sábado
 */
interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
}

const EventCard = ({ event, onEdit, onDelete, showActions = false }: EventCardProps) => {
  // Configuração de cores por tipo de sábado
  const getSaturdayTypeConfig = (type: SaturdayType) => {
    switch (type) {
      case SaturdayType.FIRST:
        return {
          label: '1º Sábado - Oração',
          color: '#9c27b0' as const, // Purple
          bgColor: '#f3e5f5',
        };
      case SaturdayType.SECOND:
        return {
          label: '2º Sábado - Evento',
          color: '#ff9800' as const, // Orange
          bgColor: '#fff3e0',
        };
      case SaturdayType.THIRD:
        return {
          label: '3º Sábado - Formação I',
          color: '#2196f3' as const, // Blue
          bgColor: '#e3f2fd',
        };
      case SaturdayType.FOURTH:
        return {
          label: '4º Sábado - Formação II',
          color: '#4caf50' as const, // Green
          bgColor: '#e8f5e9',
        };
      default:
        return {
          label: 'Encontro',
          color: '#757575' as const,
          bgColor: '#f5f5f5',
        };
    }
  };

  const typeConfig = getSaturdayTypeConfig(event.saturdayType);

  // Formata a data do evento
  const formattedDate = format(event.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const dayOfWeek = format(event.date, 'EEEE', { locale: ptBR });

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${typeConfig.color}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={typeConfig.label}
            size="small"
            sx={{
              backgroundColor: typeConfig.bgColor,
              color: typeConfig.color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          {showActions && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Editar evento">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(event)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir evento">
                <IconButton
                  size="small"
                  onClick={() => onDelete?.(event.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {event.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {event.description}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {dayOfWeek}, {formattedDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {event.startTime} - {event.endTime}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
          </Box>
        </Box>

        {event.isSpecialEvent && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label="Evento Especial"
              size="small"
              color="secondary"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        )}

        {event.attendees.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {event.attendees.length} {event.attendees.length === 1 ? 'participante' : 'participantes'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;

// Made with Bob