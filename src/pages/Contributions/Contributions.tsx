import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  PendingActions as PendingActionsIcon,
  CalendarMonth as CalendarMonthIcon,
  Favorite as FavoriteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { EmptyState, PageHeader, StatCard } from '../../components/common';

type ContributionStatus = 'paid' | 'pending' | 'late';
type ContributionType = 'monthly' | 'donation' | 'special';

interface ContributionItem {
  id: string;
  contributor: string;
  description: string;
  amount: number;
  date: string;
  status: ContributionStatus;
  type: ContributionType;
}

const contributionData: ContributionItem[] = [];

const statusLabel: Record<ContributionStatus, string> = {
  paid: 'Recebida',
  pending: 'Pendente',
  late: 'Atrasada',
};

const typeLabel: Record<ContributionType, string> = {
  monthly: 'Mensalidade',
  donation: 'Doação',
  special: 'Especial',
};

const statusColor: Record<ContributionStatus, 'success' | 'warning' | 'error'> = {
  paid: 'success',
  pending: 'warning',
  late: 'error',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));

const Contributions = () => {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ContributionStatus>('all');

  const filteredContributions = useMemo(() => {
    return contributionData.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPeriod =
        periodFilter === 'all' ||
        (periodFilter === 'month' && item.date.startsWith('2026-05')) ||
        (periodFilter === 'last-month' && item.date.startsWith('2026-04'));

      return matchesStatus && matchesPeriod;
    });
  }, [periodFilter, statusFilter]);

  const totalArrecadado = filteredContributions
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPendentes = filteredContributions
    .filter((item) => item.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <Box>
      <PageHeader
        title="Contribuições"
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Total arrecadado"
            value={formatCurrency(totalArrecadado)}
            icon={<AttachMoneyIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Pendentes"
            value={formatCurrency(totalPendentes)}
            icon={<PendingActionsIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: { xs: 3, md: 3.5 },
          border: '1px solid rgba(26, 71, 49, 0.08)',
          background: 'linear-gradient(135deg, rgba(26, 71, 49, 0.03) 0%, rgba(184, 134, 11, 0.02) 100%)',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Período"
              value={periodFilter}
              onChange={(event) => setPeriodFilter(event.target.value)}
            >
              <MenuItem value="all">Todo o histórico</MenuItem>
              <MenuItem value="month">Mês atual</MenuItem>
              <MenuItem value="last-month">Mês anterior</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | ContributionStatus)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="paid">Recebidas</MenuItem>
              <MenuItem value="pending">Pendentes</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {filteredContributions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 3, md: 4 },
            border: '1px solid rgba(26, 71, 49, 0.08)',
            background: 'linear-gradient(135deg, rgba(26, 71, 49, 0.025) 0%, rgba(184, 134, 11, 0.02) 100%)',
          }}
        >
          <EmptyState
            title="Nenhuma contribuição encontrada"
            description="Ajuste os filtros para visualizar mensalidades e doações registradas."
          />
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredContributions.map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item.id}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  height: '100%',
                  borderRadius: { xs: 3, md: 3.5 },
                  border: '1px solid rgba(26, 71, 49, 0.08)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(26, 71, 49, 0.02) 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -28,
                    bottom: -28,
                    width: 120,
                    height: 120,
                    backgroundImage: 'url(/src/assets/brasao-gj.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.035,
                    pointerEvents: 'none',
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                      mb: 1.75,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Merriweather, serif',
                          fontWeight: 700,
                          color: 'primary.main',
                          mb: 0.5,
                        }}
                      >
                        {item.contributor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>

                    <Chip
                      label={statusLabel[item.status]}
                      color={statusColor[item.status]}
                      icon={
                        item.status === 'paid' ? <CheckCircleIcon /> : <ScheduleIcon />
                      }
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      icon={<FavoriteIcon />}
                      label={typeLabel[item.type]}
                      variant="outlined"
                    />
                    <Chip
                      icon={<CalendarMonthIcon />}
                      label={formatDate(item.date)}
                      variant="outlined"
                    />
                  </Box>

                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, rgba(26, 71, 49, 0.06) 0%, rgba(184, 134, 11, 0.06) 100%)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Valor registrado
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: item.status === 'paid' ? 'success.main' : item.status === 'late' ? 'error.main' : 'warning.main',
                        fontFamily: 'Merriweather, serif',
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Contributions;
