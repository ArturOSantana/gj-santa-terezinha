import { useState, useEffect, useMemo } from 'react';
import { DashboardStats, Event, Activity, Member, Transaction, TransactionType } from '../types';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';
import { canView } from '../utils/permissions';

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribeEvents: (() => void) | undefined;
    let unsubscribeMembers: (() => void) | undefined;
    let unsubscribeTransactions: (() => void) | undefined;
    let membersLoaded = !canView(user.role, 'member');
    let eventsLoaded = false;
    let transactionsLoaded = !canView(user.role, 'finance');

    const finishLoadingIfReady = () => {
      if (membersLoaded && eventsLoaded && transactionsLoaded) {
        setLoading(false);
      }
    };

    try {
      if (canView(user.role, 'member')) {
        unsubscribeMembers = firestoreService.getMembers(user.role, (updatedMembers) => {
          setMembers(updatedMembers);
          membersLoaded = true;
          finishLoadingIfReady();
        });
      } else {
        setMembers([]);
      }

      unsubscribeEvents = firestoreService.getEvents(user.role, (updatedEvents) => {
        setEvents(updatedEvents);
        eventsLoaded = true;
        finishLoadingIfReady();
      });

      if (canView(user.role, 'finance')) {
        unsubscribeTransactions = firestoreService.getTransactions(user.role, (updatedTransactions) => {
          setTransactions(updatedTransactions);
          transactionsLoaded = true;
          finishLoadingIfReady();
        });
      } else {
        setTransactions([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      setError(errorMessage);
      setLoading(false);
    }

    return () => {
      unsubscribeMembers?.();
      unsubscribeEvents?.();
      unsubscribeTransactions?.();
    };
  }, [user]);

  const stats = useMemo<DashboardStats | null>(() => {
    if (!user) {
      return null;
    }

    const now = new Date();
    const upcomingEventsSorted = [...events]
      .filter((event) => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const nextEvent = upcomingEventsSorted[0] || null;

    const totalMembers = canView(user.role, 'member') ? members.length : 0;

    const balance = canView(user.role, 'finance')
      ? transactions.reduce((acc, transaction) => {
          if (transaction.type === TransactionType.INCOME) {
            return acc + transaction.amount;
          }
          return acc - transaction.amount;
        }, 0)
      : 0;

    return {
      totalMembers,
      nextEvent,
      balance,
      attendanceRate: 0, // Funcionalidade de presença removida
    };
  }, [user, members, events, transactions]);

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((event) => event.date >= new Date())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 3),
    [events]
  );

  const recentActivities = useMemo<Activity[]>(() => {
    const recentEventActivities: Activity[] = events
      .slice(0, 3)
      .map((event) => ({
        id: `event-${event.id}`,
        type: 'event',
        description: `Evento: ${event.title}`,
        timestamp: event.updatedAt,
        icon: 'event',
      }));

    const recentTransactionActivities: Activity[] = transactions
      .slice(0, 3)
      .map((transaction) => ({
        id: `transaction-${transaction.id}`,
        type: 'transaction',
        description: `${transaction.type === TransactionType.INCOME ? 'Entrada' : 'Saída'}: ${transaction.description}`,
        timestamp: transaction.updatedAt,
        icon: 'transaction',
      }));

    const recentMemberActivities: Activity[] = members
      .slice(0, 3)
      .map((member) => ({
        id: `member-${member.id}`,
        type: 'member',
        description: `Membro: ${member.name}`,
        timestamp: member.updatedAt,
        icon: 'member',
      }));

    return [...recentEventActivities, ...recentTransactionActivities, ...recentMemberActivities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }, [events, transactions, members]);

  return {
    loading,
    error,
    stats,
    upcomingEvents,
    recentActivities,
  };
};

