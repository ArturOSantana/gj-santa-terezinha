import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { firestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';
import { canCreate, canDelete, canEdit, canView } from '../utils/permissions';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  isWithinInterval,
} from 'date-fns';

interface TransactionFilters {
  type: 'all' | TransactionType;
  category: string;
  period: string;
  searchTerm: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface ChartData {
  expensesByCategory: Array<{ name: string; value: number }>;
  monthlyComparison: Array<{ month: string; income: number; expense: number }>;
}

export const useFinance = () => {
  const { user } = useAuth();
  
  // Estado das transações
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos filtros
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    category: 'all',
    period: 'current-month',
    searchTerm: '',
  });

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  /**
   * Configura listener em tempo real para transações do Firestore
   */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = firestoreService.getTransactions(user.role, (updatedTransactions) => {
        setTransactions(updatedTransactions);
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
      setLoading(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  /**
   * Obtém o intervalo de datas baseado no período selecionado
   */
  const getDateRange = (period: string): { start: Date; end: Date } => {
    const now = new Date();

    switch (period) {
      case 'current-month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'current-year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'last-3-months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'last-6-months':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      case 'all':
      default:
        return { start: new Date(2020, 0, 1), end: new Date(2030, 11, 31) };
    }
  };

  /**
   * Filtra as transações baseado nos filtros ativos
   */
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por período
    const dateRange = getDateRange(filters.period);
    filtered = filtered.filter((t) =>
      isWithinInterval(new Date(t.date), dateRange)
    );

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filtro por categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // Filtro por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Ordena por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [transactions, filters]);

  /**
   * Calcula o resumo financeiro baseado nas transações filtradas
   */
  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [filteredTransactions]);

  /**
   * Prepara dados para os gráficos
   */
  const chartData: ChartData = useMemo(() => {
    // Despesas por categoria
    const expensesByCategory: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    const expensesByCategoryArray = Object.entries(expensesByCategory).map(
      ([name, value]) => ({ name, value })
    );

    // Comparação mensal (últimos 6 meses)
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      };
    });

    last6Months.forEach(({ key }) => {
      monthlyData[key] = { income: 0, expense: 0 };
    });

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        if (t.type === TransactionType.INCOME) {
          monthlyData[key].income += t.amount;
        } else {
          monthlyData[key].expense += t.amount;
        }
      }
    });

    const monthlyComparison = last6Months.map(({ key, label }) => ({
      month: label,
      income: monthlyData[key].income,
      expense: monthlyData[key].expense,
    }));

    return {
      expensesByCategory: expensesByCategoryArray,
      monthlyComparison,
    };
  }, [transactions, filteredTransactions]);

  /**
   * Transações paginadas
   */
  const paginatedTransactions = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, page, rowsPerPage]);

  /**
   * Cria uma nova transação no Firestore
   */
  const handleCreateTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      if (!canCreate(user.role, 'transaction')) {
        throw new Error('Usuário não tem permissão para criar transações');
      }

      await firestoreService.createTransaction(transactionData, user.role);
      setPage(0); // Volta para a primeira página
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Atualiza uma transação existente no Firestore
   */
  const handleUpdateTransaction = async (
    id: string,
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      if (!canEdit(user.role, 'transaction')) {
        throw new Error('Usuário não tem permissão para editar transações');
      }

      await firestoreService.updateTransaction(id, transactionData, user.role);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Exclui uma transação do Firestore
   */
  const handleDeleteTransaction = async (id: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      if (!canDelete(user.role, 'transaction')) {
        throw new Error('Usuário não tem permissão para excluir transações');
      }

      await firestoreService.deleteTransaction(id, user.role);
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Abre o modal de formulário para criar nova transação
   */
  const handleOpenCreateForm = () => {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  /**
   * Abre o modal de formulário para editar transação
   */
  const handleOpenEditForm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  /**
   * Fecha o modal de formulário
   */
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTransaction(null);
  };

  /**
   * Salva a transação (criar ou atualizar)
   */
  const handleSaveTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedTransaction) {
      await handleUpdateTransaction(selectedTransaction.id, transactionData);
    } else {
      await handleCreateTransaction(transactionData);
    }
    handleCloseForm();
  };

  /**
   * Abre o diálogo de confirmação de exclusão
   */
  const handleOpenDeleteDialog = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Fecha o diálogo de confirmação de exclusão
   */
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  /**
   * Confirma a exclusão da transação
   */
  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await handleDeleteTransaction(transactionToDelete);
    }
  };

  /**
   * Atualiza os filtros
   */
  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0); // Volta para a primeira página ao filtrar
  };

  /**
   * Muda a página
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  /**
   * Exporta transações para CSV (simulado)
   */
  const handleExportCSV = () => {
    // TODO: Implementar exportação real
    alert('Exportação simulada! Em produção, isso geraria um arquivo CSV.');
  };

  const permissions = useMemo(
    () => ({
      canViewFinance: !!user && canView(user.role, 'finance'),
      canCreateTransaction: !!user && canCreate(user.role, 'transaction'),
      canEditTransaction: !!user && canEdit(user.role, 'transaction'),
      canDeleteTransaction: !!user && canDelete(user.role, 'transaction'),
    }),
    [user]
  );

  return {
    // Dados
    transactions: paginatedTransactions,
    allTransactions: filteredTransactions,
    summary,
    chartData,
    loading,
    error,
    permissions,

    // Estado do formulário
    isFormOpen,
    selectedTransaction,

    // Estado de exclusão
    isDeleteDialogOpen,
    transactionToDelete,

    // Filtros
    filters,

    // Paginação
    page,
    rowsPerPage,
    totalTransactions: filteredTransactions.length,

    // Ações
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCloseForm,
    handleSaveTransaction,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    handleFilterChange,
    handlePageChange,
    handleExportCSV,
  };
};

