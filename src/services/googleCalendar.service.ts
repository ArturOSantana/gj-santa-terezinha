import { Event, EventCategory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

/**
 * Converte evento do sistema para formato do Google Calendar
 */
const convertToGoogleEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Partial<GoogleCalendarEvent> => {
  const startDateTime = event.date.toISOString();
  const endDateTime = new Date(event.date.getTime() + 2 * 60 * 60 * 1000).toISOString(); // +2 horas

  return {
    summary: event.title,
    description: event.description || '',
    start: {
      dateTime: startDateTime,
    },
    end: {
      dateTime: endDateTime,
    },
    location: event.location || '',
  };
};

/**
 * Converte evento do Google Calendar para formato do sistema
 */
const convertFromGoogleEvent = (gEvent: GoogleCalendarEvent): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> => {
  const startDate = gEvent.start.dateTime
    ? new Date(gEvent.start.dateTime)
    : new Date(gEvent.start.date!);
  
  const endDate = gEvent.end.dateTime
    ? new Date(gEvent.end.dateTime)
    : new Date(gEvent.end.date!);

  // Extrair horários
  const startTime = gEvent.start.dateTime
    ? startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '00:00';
  
  const endTime = gEvent.end.dateTime
    ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '23:59';

  // Detectar categoria do evento
  const category = detectEventCategory(gEvent);

  return {
    title: gEvent.summary,
    description: gEvent.description || '',
    date: startDate,
    startTime,
    endTime,
    location: gEvent.location || '',
    category,
    googleCalendarId: gEvent.id,
  };
};

/**
 * Detecta a categoria do evento baseado no título e descrição
 */
const detectEventCategory = (gEvent: GoogleCalendarEvent): EventCategory => {
  const title = gEvent.summary?.toLowerCase() || '';
  const description = gEvent.description?.toLowerCase() || '';
  const combined = `${title} ${description}`;

  // Detectar aniversários
  const birthdayKeywords = [
    'aniversário',
    'aniversario',
    'niver',
    'birthday',
    'anos de',
    'parabéns',
    'parabens',
    '🎂',
    '🎉',
    '🎈',
  ];

  if (birthdayKeywords.some(keyword => combined.includes(keyword))) {
    return EventCategory.BIRTHDAY;
  }

  // Detectar encontros do GJ
  const meetingKeywords = [
    'encontro',
    'reunião',
    'reuniao',
    'gj',
    'grupo de jovens',
    'meeting',
  ];

  if (meetingKeywords.some(keyword => combined.includes(keyword))) {
    return EventCategory.GJ_MEETING;
  }

  // Detectar retiros
  const retreatKeywords = [
    'retiro',
    'retreat',
    'acampamento',
    'camping',
  ];

  if (retreatKeywords.some(keyword => combined.includes(keyword))) {
    return EventCategory.RETREAT;
  }

  // Detectar missas
  const massKeywords = [
    'missa',
    'mass',
    'eucaristia',
    'celebração',
    'celebracao',
  ];

  if (massKeywords.some(keyword => combined.includes(keyword))) {
    return EventCategory.MASS;
  }

  // Padrão: evento paroquial
  return EventCategory.PARISH_EVENT;
};

export const GoogleCalendarService = {
  /**
   * Buscar eventos do Google Calendar via API serverless
   */
  async fetchEvents(timeMin?: Date, timeMax?: Date): Promise<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[]> {
    try {
      const params = new URLSearchParams({
        timeMin: (timeMin || new Date()).toISOString(),
        timeMax: (timeMax || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)).toISOString(),
      });

      const response = await fetch(`${API_BASE_URL}/google-calendar?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar eventos: ${response.statusText}`);
      }

      const data = await response.json();
      const events = data.items || [];

      return events.map((gEvent: GoogleCalendarEvent) => convertFromGoogleEvent(gEvent));
    } catch (error) {
      console.error('Erro ao buscar eventos do Google Calendar:', error);
      return [];
    }
  },

  /**
   * Criar evento no Google Calendar via API serverless
   */
  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const googleEvent = convertToGoogleEvent(event);

      const response = await fetch(`${API_BASE_URL}/google-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar evento: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Evento criado no Google Calendar:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Erro ao criar evento no Google Calendar:', error);
      return null;
    }
  },

  /**
   * Atualizar evento no Google Calendar via API serverless
   */
  async updateEvent(googleEventId: string, event: Partial<Event>): Promise<void> {
    try {
      const googleEvent = convertToGoogleEvent(event as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);

      const response = await fetch(`${API_BASE_URL}/google-calendar?eventId=${googleEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar evento: ${response.statusText}`);
      }

      console.log('✅ Evento atualizado no Google Calendar:', googleEventId);
    } catch (error) {
      console.error('❌ Erro ao atualizar evento no Google Calendar:', error);
      throw error;
    }
  },

  /**
   * Deletar evento no Google Calendar via API serverless
   */
  async deleteEvent(googleEventId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/google-calendar?eventId=${googleEventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar evento: ${response.statusText}`);
      }

      console.log('✅ Evento deletado do Google Calendar:', googleEventId);
    } catch (error) {
      console.error('❌ Erro ao deletar evento do Google Calendar:', error);
      throw error;
    }
  },
};

export default GoogleCalendarService;

// Made with Bob
