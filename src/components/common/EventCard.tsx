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
import { Event, EventCategory } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
}

const EventCard = ({ event, onEdit, onDelete, showActions = false }: EventCardProps) => {
  // Configuração de cores por categoria de evento
  const getCategoryConfig = (category: EventCategory) => {
    const categoryInfo = EVENT_CATEGORIES[category];
    const color = categoryInfo?.color || '#757575';
    
    // Gera cor de fundo mais clara baseada na cor principal
    const bgColor = color + '20'; // Adiciona transparência
    
    return {
      label: categoryInfo?.label || 'Evento',
      color,
      bgColor,
    };
  };

  const categoryConfig = getCategoryConfig(event.category);

  // Formata a data do evento
  const formattedDate = format(event.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const dayOfWeek = format(event.date, 'EEEE', { locale: ptBR });

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${categoryConfig.color}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={categoryConfig.label}
            size="small"
            sx={{
              backgroundColor: categoryConfig.bgColor,
              color: categoryConfig.color,
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

      </CardContent>
    </Card>
  );
};

export default EventCard;

