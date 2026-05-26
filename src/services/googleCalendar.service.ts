import { Event, EventCategory } from '../types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

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
   * Buscar eventos do Google Calendar via Firebase Functions
   */
  async fetchEvents(timeMin?: Date, timeMax?: Date): Promise<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[]> {
    try {
      // Usar HTTP Request Function (pública)
      const response = await fetch(
        `https://us-central1-gj-santaterezinha.cloudfunctions.net/getCalendarEvents?` +
        `timeMin=${(timeMin || new Date()).toISOString()}&` +
        `timeMax=${(timeMax || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)).toISOString()}`
      );

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
   * Criar evento no Google Calendar via Firebase Functions
   */
  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const googleEvent = convertToGoogleEvent(event);
      const createCalendarEvent = httpsCallable(functions, 'createCalendarEvent');
      
      const result = await createCalendarEvent({ event: googleEvent });
      const data = result.data as { success: boolean; event: { id: string } };
      
      console.log('✅ Evento criado no Google Calendar:', data.event.id);
      return data.event.id;
    } catch (error) {
      console.error('❌ Erro ao criar evento no Google Calendar:', error);
      return null;
    }
  },

  /**
   * Atualizar evento no Google Calendar via Firebase Functions
   */
  async updateEvent(googleEventId: string, event: Partial<Event>): Promise<void> {
    try {
      const googleEvent = convertToGoogleEvent(event as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);
      const updateCalendarEvent = httpsCallable(functions, 'updateCalendarEvent');
      
      await updateCalendarEvent({
        eventId: googleEventId,
        event: googleEvent,
      });

      console.log('✅ Evento atualizado no Google Calendar:', googleEventId);
    } catch (error) {
      console.error('❌ Erro ao atualizar evento no Google Calendar:', error);
      throw error;
    }
  },

  /**
   * Deletar evento no Google Calendar via Firebase Functions
   */
  async deleteEvent(googleEventId: string): Promise<void> {
    try {
      const deleteCalendarEvent = httpsCallable(functions, 'deleteCalendarEvent');
      
      await deleteCalendarEvent({ eventId: googleEventId });

      console.log('✅ Evento deletado do Google Calendar:', googleEventId);
    } catch (error) {
      console.error('❌ Erro ao deletar evento do Google Calendar:', error);
      throw error;
    }
  },
};

export default GoogleCalendarService;

