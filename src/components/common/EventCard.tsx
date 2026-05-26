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
    if (category === EventCategory.SOLEMNITY) CategoryIcon = CelebrationIcon;
    else if (category === EventCategory.SAINT_DAY || category === EventCategory.NOVENA) CategoryIcon = ChurchIcon;
    else if (category === EventCategory.GJ_MEETING || category === EventCategory.PARISH_EVENT) CategoryIcon = GroupsIcon;
    
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
        borderRadius: { xs: 2, md: 2.5 },
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: { xs: 'none', md: 'translateY(-2px)' },
          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${categoryConfig.color} 0%, ${alpha(categoryConfig.color, 0.7)} 100%)`,
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIconComponent sx={{ fontSize: { xs: 22, sm: 28 }, color: 'white' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'Merriweather, serif',
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </Typography>
          <Chip
            label={eventStatus.label}
            size="small"
            sx={{
              mt: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: 'white',
              fontWeight: 600,
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
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: { xs: 1.5, sm: 2 },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5em',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            lineHeight: 1.5,
          }}
        >
          {event.description}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, sm: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
            <Box
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                backgroundColor: alpha(categoryConfig.color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TimeIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: categoryConfig.color }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {dayOfWeek}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {formattedDate}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
            <Box
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                backgroundColor: alpha(categoryConfig.color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TimeIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: categoryConfig.color }} />
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              {event.startTime} - {event.endTime}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
            <Box
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '50%',
                backgroundColor: alpha(categoryConfig.color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LocationIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: categoryConfig.color }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                flex: 1,
                minWidth: 0,
              }}
            >
              {event.location}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default EventCard;

