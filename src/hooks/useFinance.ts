import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { mockTransactions } from '../utils/mockData';
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  isWithinInterval,
} from 'date-fns';

/**
 * Filtros disponíveis para transações
 */
interface TransactionFilters {
  type: 'all' | TransactionType;
  category: string;
  period: string;
  searchTerm: string;
}

/**
 * Resumo financeiro
 */
interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/**
 * Dados para gráficos
 */
interface ChartData {
  expensesByCategory: Array<{ name: string; value: number }>;
  monthlyComparison: Array<{ month: string; income: number; expense: number }>;
}

/**
 * Custom Hook para gerenciar o estado e lógica da página de finanças
 */
export const useFinance = () => {
  // Estado das transações
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

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
   * Carrega as transações mockadas na inicialização
   */
  useEffect(() => {
    setTransactions(mockTransactions);
  }, []);

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
   * Cria uma nova transação
   */
  const handleCreateTransaction = (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setPage(0); // Volta para a primeira página
  };

  /**
   * Atualiza uma transação existente
   */
  const handleUpdateTransaction = (
    id: string,
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...transactionData, id, createdAt: t.createdAt, updatedAt: new Date() }
          : t
      )
    );
  };

  /**
   * Exclui uma transação
   */
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setIsDeleteDialogOpen(false);
    setTransactionToDelete(null);
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
  const handleSaveTransaction = (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedTransaction) {
      handleUpdateTransaction(selectedTransaction.id, transactionData);
    } else {
      handleCreateTransaction(transactionData);
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
  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      handleDeleteTransaction(transactionToDelete);
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
    console.log('Exportando transações:', filteredTransactions);
    alert('Exportação simulada! Em produção, isso geraria um arquivo CSV.');
  };

  return {
    // Dados
    transactions: paginatedTransactions,
    allTransactions: filteredTransactions,
    summary,
    chartData,

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

// Made with Bob