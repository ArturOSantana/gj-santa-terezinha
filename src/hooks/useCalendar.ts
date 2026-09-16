import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Event, EventCategory } from '../types';
import { View } from 'react-big-calendar';
import { TerezinhaService } from '../services/firestore.service';
import { GoogleCalendarService } from '../services/googleCalendar.service';
import { useAuth } from '../contexts/AuthContext';
import { canCreate, canDelete, canEdit } from '../utils/permissions';

// Constantes de cache
const GOOGLE_CALENDAR_CACHE_KEY = 'google_calendar_events_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export const useCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventCategory[]>([
    EventCategory.FORMATION,
    EventCategory.MASS,
    EventCategory.MEETING,
    EventCategory.RETREAT,
    EventCategory.OUTING,
    EventCategory.LEADERSHIP_MEETING,
    EventCategory.PASTORAL,
    EventCategory.PARISH,
    EventCategory.SCHEDULE,
    EventCategory.DEADLINE,
    EventCategory.GJ_MEETING,
    EventCategory.OTHER,
  ]);
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para garantir que Google Calendar seja buscado apenas 1 vez
  const googleCalendarFetched = useRef(false);
  // Ref para armazenar eventos do Google Calendar
  const googleCalendarEvents = useRef<Event[]>([]);

  // Carrega eventos do Firestore. Usa setEvents com função de atualização para
  // preservar eventos do Google Calendar que podem já ter sido carregados na ref.
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let isMounted = true;

    const loadFirestoreEvents = async () => {
      try {
        const firestoreEvents = await TerezinhaService.getEvents();
        if (isMounted) {
          console.log('[Firestore] Carregado:', firestoreEvents.length, 'eventos');
          // Preserva eventos do Google Calendar já carregados (evita race condition)
          setEvents(prev => {
            const googleEvents = prev.filter(e => e.id.startsWith('google-'));
            return [...firestoreEvents, ...googleEvents];
          });
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
          setLoading(false);
        }
      }
    };

    loadFirestoreEvents();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Buscar eventos do Google Calendar apenas 1 vez por sessão (com cache de 30 min)
  useEffect(() => {
    if (!user || googleCalendarFetched.current) return;

    const fetchGoogleCalendarEvents = async () => {
      try {
        // Verificar cache no localStorage
        const cachedData = localStorage.getItem(GOOGLE_CALENDAR_CACHE_KEY);
        if (cachedData) {
          const { events: cachedEvents, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          
          // Se cache ainda é válido (menos de 30 min), usar cache
          if (now - timestamp < CACHE_DURATION) {
            console.log('[Google Calendar] Usando cache (valido por', Math.round((CACHE_DURATION - (now - timestamp)) / 60000), 'min)');
            console.log('[Google Calendar] Total de eventos em cache:', cachedEvents.length);
            
            // Armazenar eventos do Google Calendar na ref
            const newGoogleEvents = cachedEvents.map((ge: any, index: number) => ({
              ...ge,
              date: new Date(ge.date),
              createdAt: new Date(ge.createdAt),
              updatedAt: new Date(ge.updatedAt),
              id: `google-${index}-${Date.now()}`,
            }));
            
            googleCalendarEvents.current = newGoogleEvents;
            console.log('[Google Calendar] Eventos armazenados na ref:', newGoogleEvents.length);
            
            // Mesclar com eventos do Firestore
            setEvents(prevEvents => {
              console.log('[Merge] Eventos do Firestore:', prevEvents.length);
              console.log('[Merge] Total apos mesclar:', prevEvents.length + newGoogleEvents.length);
              return [...prevEvents, ...newGoogleEvents];
            });
            googleCalendarFetched.current = true;
            return; // Não buscar da API
          }
        }

        // Cache expirado ou não existe - buscar da API
        console.log('[Google Calendar] Buscando da API...');
        const googleEvents = await GoogleCalendarService.fetchEvents();
        
        if (googleEvents.length > 0) {
          // Salvar no cache
          localStorage.setItem(GOOGLE_CALENDAR_CACHE_KEY, JSON.stringify({
            events: googleEvents,
            timestamp: Date.now(),
          }));
          console.log('[Google Calendar] Cache atualizado (valido por 30 min)');

          // Armazenar eventos do Google Calendar na ref
          const newGoogleEvents = googleEvents.map((ge, index) => ({
            ...ge,
            id: `google-${index}-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          
          googleCalendarEvents.current = newGoogleEvents;
          console.log('[Google Calendar] Eventos armazenados na ref:', newGoogleEvents.length);
          
          // Mesclar com eventos do Firestore
          setEvents(prevEvents => {
            console.log('[Merge] Eventos do Firestore:', prevEvents.length);
            console.log('[Merge] Total apos mesclar:', prevEvents.length + newGoogleEvents.length);
            return [...prevEvents, ...newGoogleEvents];
          });
        }
        
        googleCalendarFetched.current = true;
      } catch (error) {
        console.error('[Google Calendar] Erro ao buscar eventos:', error);
        googleCalendarFetched.current = true; // Marcar como tentado mesmo com erro
      }
    };

    // Buscar apenas 1 vez quando o componente monta
    fetchGoogleCalendarEvents();
  }, [user]);

  // Filtra eventos baseado nos filtros selecionados
  useEffect(() => {
    console.log('[Filter] Filtrando eventos...');
    console.log('[Filter] Total de eventos antes do filtro:', events.length);
    console.log('[Filter] Filtros ativos:', filters);
    
    // Contar eventos por categoria
    const categoryCounts: Record<string, number> = {};
    events.forEach(event => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });
    console.log('[Filter] Eventos por categoria:', categoryCounts);
    
    const filtered = events.filter((event) =>
      filters.includes(event.category)
    );
    
    console.log('[Filter] Eventos apos filtro:', filtered.length);
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

        // Tentar criar no Google Calendar primeiro
        let googleEventId: string | null = null;
        try {
          googleEventId = await GoogleCalendarService.createEvent(eventData);
          // Limpar cache do Google Calendar para forçar atualização
          localStorage.removeItem(GOOGLE_CALENDAR_CACHE_KEY);
          console.log('[Cache] Google Calendar limpo (evento criado)');
        } catch (error) {
          console.warn('Não foi possível criar no Google Calendar:', error);
        }
        
        // Criar evento no Firestore (com googleCalendarId se disponível)
        const eventDataWithGoogle = googleEventId
          ? { ...eventData, googleCalendarId: googleEventId }
          : eventData;
        
        const created = await TerezinhaService.createEvent(eventDataWithGoogle);
        
        // Atualizar lista local
        setEvents((prevEvents) => [...prevEvents, created]);

        setIsFormModalOpen(false);
        setEditingEvent(null);
        return created;
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

        const event = events.find(e => e.id === id);
        
        // Se é um evento temporário do Google Calendar (ID começa com "google-")
        if (id.startsWith('google-')) {
          // Criar novo evento no Firestore com os dados atualizados
          const fullEventData = {
            ...event,
            ...eventData,
          } as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
          
          // Criar no Google Calendar primeiro
          let googleEventId: string | null = null;
          try {
            googleEventId = await GoogleCalendarService.createEvent(fullEventData);
          } catch (error) {
            console.warn('Não foi possível criar no Google Calendar:', error);
          }
          
          // Criar no Firestore
          const eventDataWithGoogle = googleEventId
            ? { ...fullEventData, googleCalendarId: googleEventId }
            : fullEventData;
          
          const created = await TerezinhaService.createEvent(eventDataWithGoogle);
          
          // Substituir o evento temporário da lista local pelo criado no Firestore
          setEvents(prevEvents => prevEvents.map(e => e.id === id ? created : e));
        } else {
          // Evento normal do Firestore - atualizar normalmente
          await TerezinhaService.updateEvent(id, eventData);
          
          // Se o evento tem googleCalendarId, atualizar no Google Calendar também
          if (event?.googleCalendarId) {
            try {
              await GoogleCalendarService.updateEvent(event.googleCalendarId, eventData);
              // Limpar cache do Google Calendar para forçar atualização
              localStorage.removeItem(GOOGLE_CALENDAR_CACHE_KEY);
              console.log('[Cache] Google Calendar limpo (evento atualizado)');
            } catch (error) {
              console.warn('Não foi possível atualizar no Google Calendar:', error);
            }
          }

          // Atualizar estado local
          setEvents(prevEvents => prevEvents.map(e => e.id === id ? { ...e, ...eventData, updatedAt: new Date() } : e));
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

        const event = events.find(e => e.id === id);
        
        // Se é um evento temporário do Google Calendar (ID começa com "google-")
        if (id.startsWith('google-')) {
          // Deletar do Google Calendar
          if (event?.googleCalendarId) {
            try {
              await GoogleCalendarService.deleteEvent(event.googleCalendarId);
              // Limpar cache do Google Calendar para forçar atualização
              localStorage.removeItem(GOOGLE_CALENDAR_CACHE_KEY);
              console.log('[Cache] Google Calendar limpo (evento deletado)');
            } catch (error) {
              console.warn('Não foi possível deletar do Google Calendar:', error);
            }
          }
          
          // Remover da lista local (não existe no Firestore)
          setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
        } else {
          // Evento normal do Firestore
          // Se o evento tem googleCalendarId, deletar do Google Calendar também
          if (event?.googleCalendarId) {
            try {
              await GoogleCalendarService.deleteEvent(event.googleCalendarId);
              // Limpar cache do Google Calendar para forçar atualização
              localStorage.removeItem(GOOGLE_CALENDAR_CACHE_KEY);
              console.log('[useCalendar] Cache do Google Calendar limpo (evento deletado)');
            } catch (error) {
              console.warn('Não foi possível deletar do Google Calendar:', error);
            }
          }

          // Deletar do Firestore
          await TerezinhaService.deleteEvent(id);

          // Remover da lista local
          setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
        }
        
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
    // Não permite criar eventos em datas anteriores a hoje (compara apenas a data, não a hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDay = new Date(slotInfo.start);
    slotDay.setHours(0, 0, 0, 0);
    if (slotDay < today) {
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
    const allCategories = [
      EventCategory.FORMATION,
      EventCategory.MASS,
      EventCategory.MEETING,
      EventCategory.RETREAT,
      EventCategory.OUTING,
      EventCategory.LEADERSHIP_MEETING,
      EventCategory.PASTORAL,
      EventCategory.PARISH,
      EventCategory.SCHEDULE,
      EventCategory.DEADLINE,
      EventCategory.GJ_MEETING,
      EventCategory.OTHER,
    ];

    if (filters.length === allCategories.length) {
      setFilters([]);
    } else {
      setFilters(allCategories);
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

