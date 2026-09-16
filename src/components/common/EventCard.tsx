import {
  Card,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Celebration as CelebrationIcon,
  Church as ChurchIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { Event, EventCategory } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/constants';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  showActions?: boolean;
}

const EventCard = ({ event, onEdit, onDelete, showActions = false }: EventCardProps) => {
  const theme = useTheme();

  const getCategoryConfig = (category: EventCategory) => {
    const categoryInfo = EVENT_CATEGORIES[category];
    const color = categoryInfo?.color || '#757575';
    
    let CategoryIcon = EventIcon;
    if (category === EventCategory.MASS) CategoryIcon = ChurchIcon;
    else if (category === EventCategory.RETREAT) CategoryIcon = CelebrationIcon;
    else if (category === EventCategory.GJ_MEETING || category === EventCategory.MEETING || category === EventCategory.LEADERSHIP_MEETING) CategoryIcon = GroupsIcon;
    
    return {
      label: categoryInfo?.label || 'Evento',
      color,
      Icon: CategoryIcon,
    };
  };

  const categoryConfig = getCategoryConfig(event.category);

  const getEventStatus = () => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (isToday(eventDate)) {
      return { label: 'Hoje', color: theme.palette.success.main };
    } else if (isTomorrow(eventDate)) {
      return { label: 'Amanhã', color: theme.palette.info.main };
    } else if (isBefore(eventDate, now)) {
      return { label: 'Concluído', color: theme.palette.text.disabled };
    } else {
      return { label: 'Próximo', color: theme.palette.warning.main };
    }
  };

  const eventStatus = getEventStatus();

  const formattedDate = format(event.date, "dd 'de' MMMM", { locale: ptBR });
  const dayOfWeek = format(event.date, 'EEEE', { locale: ptBR });

  const CategoryIconComponent = categoryConfig.Icon;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '12px',
        bgcolor: '#ffffff',
        border: '1px solid rgba(211, 163, 76, 0.25)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          transform: { xs: 'none', md: 'translateY(-2px)' },
          boxShadow: '0 6px 14px rgba(0, 0, 0, 0.14)',
        },
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${categoryConfig.color} 0%, ${alpha(categoryConfig.color, 0.85)} 100%)`,
          p: { xs: 1.5, sm: 1.75 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: { xs: 38, sm: 44 },
            height: { xs: 38, sm: 44 },
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIconComponent sx={{ fontSize: { xs: 20, sm: 24 }, color: '#ffffff' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: '"Fraunces", Georgia, serif',
              lineHeight: 1.2,
            }}
          >
            {event.title}
          </Typography>
          <Chip
            label={eventStatus.label}
            size="small"
            sx={{
              mt: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.28)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 18, sm: 20 },
            }}
          />
        </Box>

        {showActions && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Editar evento">
              <IconButton
                size="small"
                onClick={() => onEdit?.(event)}
                sx={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir evento">
              <IconButton
                size="small"
                onClick={() => onDelete?.(event.id)}
                sx={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 1.75 } }}>
        {event.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#6b5347',
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              lineHeight: 1.4,
            }}
          >
            {event.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: alpha(categoryConfig.color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TimeIcon sx={{ fontSize: 15, color: categoryConfig.color }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#2a1420', fontSize: { xs: '0.8rem', sm: '0.85rem' }, textTransform: 'capitalize' }}
              >
                {dayOfWeek},
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#2a1420', fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
              >
                {formattedDate}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: alpha(categoryConfig.color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TimeIcon sx={{ fontSize: 15, color: categoryConfig.color }} />
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#2a1420', fontSize: { xs: '0.8rem', sm: '0.85rem' } }}
            >
              {event.startTime} {event.endTime ? `às ${event.endTime}` : ''}
            </Typography>
          </Box>

          {event.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: alpha(categoryConfig.color, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LocationIcon sx={{ fontSize: 15, color: categoryConfig.color }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#2a1420',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {event.location}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default EventCard;

