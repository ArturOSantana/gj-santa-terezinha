import { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, EventCategory } from '../types';
import { View } from 'react-big-calendar';
import { firestoreService } from '../services/firestore.service';
import { GoogleCalendarService } from '../services/googleCalendar.service';
import { useAuth } from '../contexts/AuthContext';
import { canCreate, canDelete, canEdit } from '../utils/permissions';

export const useCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventCategory[]>([
    EventCategory.SATURDAY,
    EventCategory.SOLEMNITY,
    EventCategory.SAINT_DAY,
    EventCategory.BIRTHDAY,
    EventCategory.PARISH_EVENT,
    EventCategory.NOVENA,
  ]);
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configura listener em tempo real para eventos do Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = firestoreService.getEvents(user.role, (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  // Buscar eventos do Google Calendar e mesclar com Firestore
  useEffect(() => {
    if (!user) return;

    const fetchGoogleCalendarEvents = async () => {
      try {
        const googleEvents = await GoogleCalendarService.fetchEvents();
        
        if (googleEvents.length > 0) {
          // Mesclar eventos do Google Calendar com eventos do Firestore
          // Evitar duplicatas verificando googleCalendarId
          setEvents(prevEvents => {
            const existingGoogleIds = new Set(
              prevEvents
                .filter(e => e.googleCalendarId)
                .map(e => e.googleCalendarId)
            );

            const newGoogleEvents = googleEvents
              .filter(ge => !existingGoogleIds.has(ge.googleCalendarId))
              .map((ge, index) => ({
                ...ge,
                id: `google-${index}-${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date(),
              }));

            return [...prevEvents, ...newGoogleEvents];
          });
        }
      } catch (error) {
        console.error('Erro ao buscar eventos do Google Calendar:', error);
      }
    };

    fetchGoogleCalendarEvents();
  }, [user]);

  // Filtra eventos baseado nos filtros selecionados
  useEffect(() => {
    const filtered = events.filter((event) =>
      filters.includes(event.category)
    );
    setFilteredEvents(filtered);
  }, [events, filters]);

  /**
   * Cria um novo evento no Firestore
   */
  const handleCreateEvent = useCallback(
    async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        setError(null);
        if (!canCreate(user.role, 'event')) {
          throw new Error('Usuário não tem permissão para criar eventos');
        }

        // Criar evento no Firestore
        const eventId = await firestoreService.createEvent(eventData, user.role);
        
        // Tentar criar no Google Calendar também
        const googleEventId = await GoogleCalendarService.createEvent(eventData);
        
        // Se criou no Google Calendar, atualizar o evento no Firestore com o googleCalendarId
        if (googleEventId) {
          await firestoreService.updateEvent(eventId, { googleCalendarId }, user.role);
        }
        
        setIsFormModalOpen(false);
        setEditingEvent(null);
        return { ...eventData, id: eventId, googleCalendarId, createdAt: new Date(), updatedAt: new Date() };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar evento';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [user]
  );

  /**
   * Atualiza um evento existente no Firestore
   */
  const handleUpdateEvent = useCallback(
    async (id: string, eventData: Partial<Event>) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        setError(null);
        if (!canEdit(user.role, 'event')) {
          throw new Error('Usuário não tem permissão para editar eventos');
        }

        // Atualizar no Firestore
        await firestoreService.updateEvent(id, eventData, user.role);
        
        // Se o evento tem googleCalendarId, atualizar no Google Calendar também
        const event = events.find(e => e.id === id);
        if (event?.googleCalendarId) {
          try {
            await GoogleCalendarService.updateEvent(event.googleCalendarId, eventData);
          } catch (error) {
            console.warn('Não foi possível atualizar no Google Calendar:', error);
          }
        }
        
        setIsFormModalOpen(false);
        setIsDetailsModalOpen(false);
        setEditingEvent(null);
        setSelectedEvent(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar evento';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [user, events]
  );

  /**
   * Exclui um evento do Firestore
   */
  const handleDeleteEvent = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        setError(null);
        if (!canDelete(user.role, 'event')) {
          throw new Error('Usuário não tem permissão para excluir eventos');
        }

        // Se o evento tem googleCalendarId, deletar do Google Calendar também
        const event = events.find(e => e.id === id);
        if (event?.googleCalendarId) {
          try {
            await GoogleCalendarService.deleteEvent(event.googleCalendarId);
          } catch (error) {
            console.warn('Não foi possível deletar do Google Calendar:', error);
          }
        }

        // Deletar do Firestore
        await firestoreService.deleteEvent(id, user.role);
        setIsDetailsModalOpen(false);
        setSelectedEvent(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar evento';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [user, events]
  );

  /**
   * Atualiza os filtros de categoria de evento
   */
  const handleFilterChange = useCallback((categories: EventCategory[]) => {
    setFilters(categories);
  }, []);

  /**
   * Abre o modal de detalhes do evento
   */
  const handleSelectEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  }, []);

  /**
   * Abre o modal de criação de evento com data pré-selecionada
   */
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    // Não permite criar eventos no passado
    if (slotInfo.start < new Date()) {
      return;
    }
    
    setEditingEvent(null);
    setIsFormModalOpen(true);
    setCurrentDate(slotInfo.start);
  }, []);

  /**
   * Abre o modal de edição de evento
   */
  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  }, []);

  /**
   * Fecha o modal de detalhes
   */
  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  /**
   * Fecha o modal de formulário
   */
  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingEvent(null);
  }, []);

  /**
   * Abre o modal de criação de evento manualmente
   */
  const handleOpenCreateModal = useCallback(() => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  }, []);

  /**
   * Navega para hoje
   */
  const handleNavigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /**
   * Alterna todos os filtros
   */
  const handleToggleAllFilters = useCallback(() => {
    if (filters.length === 6) {
      setFilters([]);
    } else {
      setFilters([
        EventCategory.SATURDAY,
        EventCategory.SOLEMNITY,
        EventCategory.SAINT_DAY,
        EventCategory.BIRTHDAY,
        EventCategory.PARISH_EVENT,
        EventCategory.NOVENA,
      ]);
    }
  }, [filters]);

  const permissions = useMemo(
    () => ({
      canCreateEvent: !!user && canCreate(user.role, 'event'),
      canEditEvent: !!user && canEdit(user.role, 'event'),
      canDeleteEvent: !!user && canDelete(user.role, 'event'),
    }),
    [user]
  );

  return {
    // Estado
    events: filteredEvents,
    allEvents: events,
    selectedEvent,
    isDetailsModalOpen,
    isFormModalOpen,
    editingEvent,
    filters,
    view,
    currentDate,
    loading,
    error,
    permissions,

    // Ações
    setView,
    setCurrentDate,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleFilterChange,
    handleSelectEvent,
    handleSelectSlot,
    handleEditEvent,
    handleCloseDetailsModal,
    handleCloseFormModal,
    handleOpenCreateModal,
    handleNavigateToday,
    handleToggleAllFilters,
  };
};

