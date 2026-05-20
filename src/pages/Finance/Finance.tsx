import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFinance } from '../../hooks/useFinance';
import FinancialSummaryCard from '../../components/common/FinancialSummaryCard';
import TransactionCard from '../../components/common/TransactionCard';
import TransactionFormModal from '../../components/common/TransactionFormModal';
import { TRANSACTION_CATEGORIES, PERIOD_OPTIONS, CATEGORY_LABELS, TRANSACTION_COLORS } from '../../utils/constants';
import { TransactionType } from '../../types';

const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const Finance = () => {
  const {
    transactions,
    allTransactions,
    summary,
    chartData,
    isFormOpen,
    selectedTransaction,
    isDeleteDialogOpen,
    filters,
    page,
    rowsPerPage,
    totalTransactions,
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
    permissions,
  } = useFinance();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, border: '2px solid #1e1e1e' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="primary">
            {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const getAvailableCategories = () => {
    if (filters.type === TransactionType.INCOME) {
      return TRANSACTION_CATEGORIES.income;
    } else if (filters.type === TransactionType.EXPENSE) {
      return TRANSACTION_CATEGORIES.expense;
    }
    return [...TRANSACTION_CATEGORIES.income, ...TRANSACTION_CATEGORIES.expense];
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ py: { xs: 1, sm: 2 }, display: 'grid', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0, p: { xs: 2.5, sm: 3.5 }, backgroundColor: '#d8cfbe', border: '2px solid #1e1e1e', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Controle Financeiro
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie as receitas e despesas do grupo de jovens
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
            >
              Exportar
            </Button>
            {permissions.canCreateTransaction && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateForm}
              >
                Nova Transação
              </Button>
            )}
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 0 }}>
          <FinancialSummaryCard
            title="Total de Receitas"
            value={summary.totalIncome}
            type="income"
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
          />
          <FinancialSummaryCard
            title="Total de Despesas"
            value={summary.totalExpense}
            type="expense"
            icon={<TrendingDownIcon sx={{ fontSize: 32 }} />}
          />
          <FinancialSummaryCard
            title="Saldo Atual"
            value={summary.balance}
            type="balance"
            icon={<AccountBalanceIcon sx={{ fontSize: 32 }} />}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 0 }}>
          <Paper sx={{ p: 3, border: '2px solid #1e1e1e' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Despesas por Categoria
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {chartData.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${CATEGORY_LABELS[name as string] || name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.expensesByCategory.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="text.secondary">Nenhuma despesa registrada</Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3, border: '2px solid #1e1e1e' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Receitas vs Despesas (Últimos 6 Meses)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" name="Receitas" fill={TRANSACTION_COLORS.income.main} />
                <Bar dataKey="expense" name="Despesas" fill={TRANSACTION_COLORS.expense.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, mb: 0, border: '2px solid #1e1e1e' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Filtros
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar transação..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                label="Tipo"
                onChange={(e) => handleFilterChange({ type: e.target.value as any, category: 'all' })}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value={TransactionType.INCOME}>Entradas</MenuItem>
                <MenuItem value={TransactionType.EXPENSE}>Saídas</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filters.category}
                label="Categoria"
                onChange={(e) => handleFilterChange({ category: e.target.value })}
              >
                <MenuItem value="all">Todas</MenuItem>
                {getAvailableCategories().map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={filters.period}
                label="Período"
                onChange={(e) => handleFilterChange({ period: e.target.value })}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {(filters.type !== 'all' || filters.category !== 'all' || filters.searchTerm) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.type !== 'all' && (
                <Chip
                  label={`Tipo: ${filters.type === TransactionType.INCOME ? 'Entradas' : 'Saídas'}`}
                  onDelete={() => handleFilterChange({ type: 'all' })}
                  size="small"
                />
              )}
              {filters.category !== 'all' && (
                <Chip
                  label={`Categoria: ${CATEGORY_LABELS[filters.category] || filters.category}`}
                  onDelete={() => handleFilterChange({ category: 'all' })}
                  size="small"
                />
              )}
              {filters.searchTerm && (
                <Chip
                  label={`Busca: "${filters.searchTerm}"`}
                  onDelete={() => handleFilterChange({ searchTerm: '' })}
                  size="small"
                />
              )}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, border: '2px solid #1e1e1e' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Transações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalTransactions} {totalTransactions === 1 ? 'transação' : 'transações'}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {transactions.length > 0 ? (
            <>
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleOpenEditForm}
                  onDelete={handleOpenDeleteDialog}
                  canEdit={permissions.canEditTransaction}
                  canDelete={permissions.canDeleteTransaction}
                />
              ))}

              {totalTransactions > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={Math.ceil(totalTransactions / rowsPerPage)}
                    page={page + 1}
                    onChange={(_, newPage) => handlePageChange(newPage - 1)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              Nenhuma transação encontrada com os filtros aplicados.
            </Alert>
          )}
        </Paper>

        {allTransactions.length > 0 && (
          <Paper sx={{ p: 3, mt: 0, backgroundColor: '#efe8da', border: '2px solid #1e1e1e' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total de Entradas
                </Typography>
                <Typography variant="h6" sx={{ color: TRANSACTION_COLORS.income.main, fontWeight: 700 }}>
                  {formatCurrency(summary.totalIncome)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total de Saídas
                </Typography>
                <Typography variant="h6" sx={{ color: TRANSACTION_COLORS.expense.main, fontWeight: 700 }}>
                  {formatCurrency(summary.totalExpense)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Saldo do Período
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: summary.balance >= 0 ? TRANSACTION_COLORS.income.main : TRANSACTION_COLORS.expense.main,
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(summary.balance)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        <TransactionFormModal
          open={isFormOpen}
          transaction={selectedTransaction}
          onClose={handleCloseForm}
          onSave={handleSaveTransaction}
          readOnly={!permissions.canCreateTransaction && !permissions.canEditTransaction}
        />

        {permissions.canDeleteTransaction && (
          <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogContent>
              <Typography>
                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="inherit">
                Cancelar
              </Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">
                Excluir
              </Button>
            </DialogActions>
          </Dialog>
        )}

      </Box>
    </Container>
  );
};

export default Finance;

