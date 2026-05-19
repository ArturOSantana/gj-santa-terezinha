import { useState, useEffect } from 'react';
import { DashboardStats, Event, Activity } from '../types';
import { mockStats, mockEvents, mockActivities } from '../utils/mockData';

/**
 * Custom Hook para gerenciar dados do Dashboard
 * Simula carregamento de dados e fornece estado para o Dashboard
 */
export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simula carregamento de dados da API
    const loadDashboardData = async () => {
      setLoading(true);

      // Simula delay de rede (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        // Carrega estatísticas
        setStats(mockStats);

        // Filtra e ordena próximos eventos (apenas eventos futuros)
        const now = new Date();
        const futureEvents = mockEvents
          .filter((event) => event.date >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 3); // Pega apenas os 3 próximos

        setUpcomingEvents(futureEvents);

        // Carrega atividades recentes (ordenadas por timestamp decrescente)
        const sortedActivities = [...mockActivities].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        setRecentActivities(sortedActivities.slice(0, 5)); // Pega apenas as 5 mais recentes
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return {
    loading,
    stats,
    upcomingEvents,
    recentActivities,
  };
};

// Made with Bob