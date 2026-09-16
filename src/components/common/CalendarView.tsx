import React from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Event, EventCategory } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/constants';
import { Box } from '@mui/material';

// Configuração do localizador para português
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Mensagens em português para o calendário
const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
};

// Interface para eventos do calendário
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

interface CalendarViewProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  view: View;
  onViewChange: (view: View) => void;
  date?: Date;
  onNavigate?: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  onSelectSlot,
  view,
  onViewChange,
  date,
  onNavigate,
}) => {
  // Converte eventos para o formato do calendário
  const calendarEvents: CalendarEvent[] = events.map((event) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const start = new Date(event.date);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(event.date);
    end.setHours(endHour, endMinute, 0, 0);

    return {
      id: event.id,
      title: event.title,
      start,
      end,
      resource: event,
    };
  });

  // Função para estilizar eventos baseado na categoria
  const eventStyleGetter = (event: CalendarEvent) => {
    const category = event.resource.category;
    const categoryInfo = EVENT_CATEGORIES[category];
    const backgroundColor = categoryInfo?.color || '#3174ad';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: 500,
      },
    };
  };

  return (
    <Box
      sx={{
        height: '100%',
        '& .rbc-calendar': {
          height: '100%',
        },
        '& .rbc-header': {
          padding: '10px 3px',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#2a1420',
          borderColor: 'rgba(211, 163, 76, 0.25)',
        },
        '& .rbc-today': {
          backgroundColor: 'rgba(193, 92, 113, 0.12)',
        },
        '& .rbc-off-range-bg': {
          backgroundColor: 'rgba(74, 50, 39, 0.05)',
        },
        '& .rbc-event': {
          padding: '4px 6px',
          fontSize: '0.875rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
        },
        '& .rbc-event-label': {
          fontSize: '0.75rem',
        },
        '& .rbc-toolbar': {
          padding: '10px 0',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '10px',
        },
        '& .rbc-toolbar-label': {
          fontWeight: 700,
          fontFamily: '"Fraunces", Georgia, serif',
          color: '#2a1420',
          fontSize: '1.1rem',
        },
        '& .rbc-toolbar button': {
          color: '#2a1420',
          border: '1px solid rgba(211, 163, 76, 0.35)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.875rem',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#efe2c4',
            borderColor: '#d3a34c',
          },
          '&:active, &.rbc-active': {
            backgroundColor: '#c15c71',
            color: '#ffffff',
            borderColor: '#c15c71',
          },
        },
        '& .rbc-month-view': {
          border: '1px solid rgba(211, 163, 76, 0.25)',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        },
        '& .rbc-day-bg': {
          borderColor: 'rgba(211, 163, 76, 0.18)',
        },
        '& .rbc-month-row': {
          borderColor: 'rgba(211, 163, 76, 0.18)',
        },
        '& .rbc-header + .rbc-header': {
          borderColor: 'rgba(211, 163, 76, 0.25)',
        },
        '& .rbc-agenda-view': {
          border: '1px solid rgba(211, 163, 76, 0.25)',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        },
        '& .rbc-agenda-table': {
          borderColor: 'rgba(211, 163, 76, 0.25)',
        },
        '& .rbc-agenda-date-cell, & .rbc-agenda-time-cell': {
          padding: '8px 10px',
          color: '#2a1420',
          fontWeight: 600,
        },
        '& .rbc-agenda-event-cell': {
          padding: '8px 10px',
          color: '#2a1420',
        },
      }}
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', minHeight: '500px' }}
        messages={messages}
        culture="pt-BR"
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        onSelectSlot={onSelectSlot}
        selectable
        view={view}
        onView={onViewChange}
        date={date}
        onNavigate={onNavigate}
        eventPropGetter={eventStyleGetter}
        popup
        views={['month', 'week', 'day', 'agenda']}
        step={30}
        showMultiDayTimes
        defaultDate={new Date()}
      />
    </Box>
  );
};

export default CalendarView;

