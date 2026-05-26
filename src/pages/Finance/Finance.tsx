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
  Divider,
  Grid,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useMemo } from 'react';
import { useFinance } from '../../hooks/useFinance';
import FinancialSummaryCard from '../../components/common/FinancialSummaryCard';
import TransactionCard from '../../components/common/TransactionCard';
import TransactionFormModal from '../../components/common/TransactionFormModal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { TRANSACTION_CATEGORIES, PERIOD_OPTIONS, CATEGORY_LABELS, TRANSACTION_COLORS } from '../../utils/constants';
import { TransactionType } from '../../types';

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

  const getAvailableCategories = () => {
    if (filters.type === TransactionType.INCOME) {
      return TRANSACTION_CATEGORIES.income;
    } else if (filters.type === TransactionType.EXPENSE) {
      return TRANSACTION_CATEGORIES.expense;
    }
    return [...TRANSACTION_CATEGORIES.income, ...TRANSACTION_CATEGORIES.expense];
  };

  const maxMonthlyValue = useMemo(() => {
    return Math.max(
      ...chartData.monthlyComparison.flatMap((item) => [item.income, item.expense]),
      1
    );
  }, [chartData.monthlyComparison]);

  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === filters.period)?.label ?? 'Período selecionado';

  const headerAction = (
    <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleExportCSV}
        sx={{ borderRadius: 2.5 }}
      >
        Exportar
      </Button>
      {permissions.canCreateTransaction && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateForm}
          sx={{ borderRadius: 2.5, px: 2.25 }}
        >
          Nova Transação
        </Button>
      )}
    </Stack>
  );

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ py: { xs: 1.5, sm: 2.5 }, display: 'grid', gap: { xs: 2.5, md: 3.5 } }}>
        <PageHeader
          title="Controle Financeiro"
          action={headerAction}
        />

        <Grid container columnSpacing={{ xs: 2, md: 3 }} rowSpacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 12, md: 3.5 }}>
            <FinancialSummaryCard
              title="Total de Receitas"
              value={summary.totalIncome}
              type="income"
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ mt: { md: 1.2 } }}>
              <FinancialSummaryCard
                title="Total de Despesas"
                value={summary.totalExpense}
                type="expense"
                icon={<TrendingDownIcon sx={{ fontSize: 32 }} />}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <FinancialSummaryCard
              title="Saldo Atual"
              value={summary.balance}
              type="balance"
              icon={<AccountBalanceIcon sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Paper
              sx={{
                p: 2.25,
                borderRadius: 3,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.16) 0%, rgba(255,255,255,0.96) 100%)',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Resultado
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color: summary.balance >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {summary.balance >= 0 ? 'Positivo' : 'Ajustar gastos'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container columnSpacing={{ xs: 2, md: 3 }} rowSpacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, lg: 4.5 }}>
            <Paper
              sx={{
                p: { xs: 1.75, sm: 2, md: 2.75 },
                borderRadius: { xs: 3, md: 3.5 },
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, md: 1 }, mb: { xs: 1.75, md: 2 } }}>
                <InsightsIcon sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                  }}
                >
                  Filtros
                </Typography>
              </Box>

              <Stack spacing={2.25}>
                <TextField
                  fullWidth
                  placeholder="Buscar transação..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                    },
                  }}
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

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 1.75,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={filters.type}
                      label="Tipo"
                      onChange={(e) => handleFilterChange({ type: e.target.value as any, category: 'all' })}
                      sx={{ borderRadius: 2.5 }}
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
                      sx={{ borderRadius: 2.5 }}
                    >
                      <MenuItem value="all">Todas</MenuItem>
                      {getAvailableCategories().map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ gridColumn: { md: '1 / -1' } }}>
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={filters.period}
                      label="Período"
                      onChange={(e) => handleFilterChange({ period: e.target.value })}
                      sx={{ borderRadius: 2.5 }}
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
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {filters.type !== 'all' && (
                      <Chip
                        label={`Tipo: ${filters.type === TransactionType.INCOME ? 'Entradas' : 'Saídas'}`}
                        onDelete={() => handleFilterChange({ type: 'all' })}
                        size="small"
                        sx={{ bgcolor: alpha(TRANSACTION_COLORS.income.main, 0.1) }}
                      />
                    )}
                    {filters.category !== 'all' && (
                      <Chip
                        label={`Categoria: ${CATEGORY_LABELS[filters.category] || filters.category}`}
                        onDelete={() => handleFilterChange({ category: 'all' })}
                        size="small"
                        sx={{ bgcolor: alpha(TRANSACTION_COLORS.expense.main, 0.1) }}
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

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(26,71,49,0.05) 0%, rgba(26,71,49,0.01) 100%)',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Transações no recorte atual
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalTransactions}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 7.5 }}>
            <Stack spacing={2.5}>
              <Paper
                sx={{
                  p: { xs: 1.75, sm: 2, md: 2.75 },
                  borderRadius: { xs: 3, md: 3.5 },
                  background: 'linear-gradient(135deg, rgba(248,245,238,1) 0%, rgba(255,255,255,1) 100%)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, md: 1 }, mb: { xs: 2, md: 2.25 } }}>
                  <TimelineIcon sx={{ color: 'secondary.main', fontSize: { xs: 20, sm: 24 } }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                    }}
                  >
                    Receitas vs Despesas
                  </Typography>
                </Box>

                <Stack spacing={{ xs: 1.25, md: 1.5 }}>
                  {chartData.monthlyComparison.map((item, index) => (
                    <Box
                      key={item.month}
                      sx={{
                        p: { xs: 1.25, sm: 1.5 },
                        borderRadius: { xs: 2, md: 2.5 },
                        ml: index % 2 === 0 ? 0 : { md: 1.5 },
                        bgcolor: index % 2 === 0 ? alpha('#1a4731', 0.03) : alpha('#8b5e34', 0.04),
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 0.75, md: 1 }, flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '0.85rem', sm: '0.875rem' },
                          }}
                        >
                          {item.month}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          Comparativo mensal
                        </Typography>
                      </Box>

                      <Stack spacing={1.1}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography variant="caption" color="text.secondary">
                              Receitas
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: TRANSACTION_COLORS.income.main }}>
                              {formatCurrency(item.income)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 10,
                              borderRadius: 999,
                              bgcolor: alpha(TRANSACTION_COLORS.income.main, 0.12),
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(item.income / maxMonthlyValue) * 100}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${TRANSACTION_COLORS.income.main} 0%, ${TRANSACTION_COLORS.income.light} 100%)`,
                              }}
                            />
                          </Box>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                            <Typography variant="caption" color="text.secondary">
                              Despesas
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: TRANSACTION_COLORS.expense.main }}>
                              {formatCurrency(item.expense)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 10,
                              borderRadius: 999,
                              bgcolor: alpha(TRANSACTION_COLORS.expense.main, 0.12),
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(item.expense / maxMonthlyValue) * 100}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${TRANSACTION_COLORS.expense.main} 0%, ${TRANSACTION_COLORS.expense.light} 100%)`,
                              }}
                            />
                          </Box>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3.5,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Despesas por categoria
                </Typography>

                {chartData.expensesByCategory.length > 0 ? (
                  <Stack spacing={1.25}>
                    {chartData.expensesByCategory.map((item, index) => (
                      <Box
                        key={item.name}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 2.5,
                          mr: index === 1 ? { md: 2 } : 0,
                          bgcolor: alpha('#8b5e34', 0.05),
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {CATEGORY_LABELS[item.name] || item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Participação no período filtrado
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {formatCurrency(item.value)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="Sem despesas categorizadas"
                    description="Quando houver saídas registradas no período, o resumo por categoria aparecerá aqui."
                  />
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Paper sx={{ p: { xs: 2, md: 2.75 }, borderRadius: 3.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 1,
              mb: 2.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Transações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalTransactions} {totalTransactions === 1 ? 'transação' : 'transações'}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {transactions.length > 0 ? (
            <>
              <Stack spacing={2}>
                {transactions.map((transaction, index) => (
                  <Box key={transaction.id} sx={{ ml: index % 2 === 0 ? 0 : { md: 1.5 } }}>
                    <TransactionCard
                      transaction={transaction}
                      onEdit={handleOpenEditForm}
                      onDelete={handleOpenDeleteDialog}
                      canEdit={permissions.canEditTransaction}
                      canDelete={permissions.canDeleteTransaction}
                    />
                  </Box>
                ))}
              </Stack>

              {totalTransactions > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3.5 }}>
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
            <EmptyState
              title="Nenhuma transação encontrada"
              description="Os filtros atuais não retornaram resultados. Ajuste os critérios ou registre uma nova movimentação."
              action={
                permissions.canCreateTransaction ? (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateForm}
                    sx={{ borderRadius: 2.5 }}
                  >
                    Nova Transação
                  </Button>
                ) : undefined
              }
            />
          )}
        </Paper>

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

