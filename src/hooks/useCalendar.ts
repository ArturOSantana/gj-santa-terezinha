import { useState, useEffect, useCallback } from 'react';
import { Event, SaturdayType } from '../types';
import { mockEvents } from '../utils/mockData';
import { View } from 'react-big-calendar';

/**
 * Hook customizado para gerenciar o estado e lógica do calendário
 */
export const useCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<SaturdayType[]>([
    SaturdayType.FIRST,
    SaturdayType.SECOND,
    SaturdayType.THIRD,
    SaturdayType.FOURTH,
  ]);
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Carrega eventos mockados na inicialização
  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  // Filtra eventos baseado nos filtros selecionados
  useEffect(() => {
    const filtered = events.filter((event) =>
      filters.includes(event.saturdayType)
    );
    setFilteredEvents(filtered);
  }, [events, filters]);

  /**
   * Cria um novo evento
   */
  const handleCreateEvent = useCallback(
    (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setEvents((prev) => [...prev, newEvent]);
      setIsFormModalOpen(false);
      setEditingEvent(null);
      return newEvent;
    },
    []
  );

  /**
   * Atualiza um evento existente
   */
  const handleUpdateEvent = useCallback(
    (id: string, eventData: Partial<Event>) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id
            ? { ...event, ...eventData, updatedAt: new Date() }
            : event
        )
      );
      setIsFormModalOpen(false);
      setIsDetailsModalOpen(false);
      setEditingEvent(null);
      setSelectedEvent(null);
    },
    []
  );

  /**
   * Exclui um evento
   */
  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  /**
   * Atualiza os filtros de tipo de sábado
   */
  const handleFilterChange = useCallback((types: SaturdayType[]) => {
    setFilters(types);
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
    if (filters.length === 4) {
      setFilters([]);
    } else {
      setFilters([
        SaturdayType.FIRST,
        SaturdayType.SECOND,
        SaturdayType.THIRD,
        SaturdayType.FOURTH,
      ]);
    }
  }, [filters]);

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

// Made with Bob