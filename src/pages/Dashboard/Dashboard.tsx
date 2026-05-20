import {
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import EventCard from '../../components/common/EventCard';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { loading, stats, upcomingEvents, recentActivities } = useDashboard();

  // Renderiza loading enquanto carrega dados
  if (loading) {
    return (
      <Container maxWidth="lg">
        <LoadingSpinner message="Carregando dashboard..." />
      </Container>
    );
  }

  // Renderiza erro se não houver stats
  if (!stats) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Erro ao carregar dados do dashboard. Por favor, tente novamente.
          </Alert>
        </Box>
      </Container>
    );
  }

  // Função para obter ícone da atividade
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'attendance':
        return <CheckCircleIcon color="success" />;
      case 'transaction':
        return <AttachMoneyIcon color="primary" />;
      case 'member':
        return <PersonIcon color="info" />;
      case 'event':
        return <EventIcon color="secondary" />;
      case 'receipt':
        return <ReceiptIcon color="warning" />;
      default:
        return <CheckCircleIcon />;
    }
  };

  // Formata o valor do saldo
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formata a data do próximo evento
  const nextEventDate = stats.nextEvent
    ? format(stats.nextEvent.date, "dd/MM/yyyy", { locale: ptBR })
    : 'Nenhum evento agendado';

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ py: { xs: 1, sm: 2 }, display: 'grid', gap: 3 }}>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            background: 'linear-gradient(135deg, rgba(47,93,80,0.10) 0%, rgba(184,138,68,0.08) 100%)',
            border: '1px solid',
            borderColor: 'rgba(47,93,80,0.10)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visão geral do Grupo de Jovens e dos próximos acompanhamentos da comunidade.
          </Typography>
        </Paper>

        {/* Seção de Estatísticas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: user?.role === 'member' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            mb: 1,
          }}
        >
          {/* Total de Membros - Apenas para Admin e Coordinator */}
          {user?.role !== 'member' && (
            <StatCard
              title="Total de Membros"
              value={stats.totalMembers}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="primary"
            />
          )}
          
          {/* Próximo Encontro - Para todos */}
          <StatCard
            title="Próximo Encontro"
            value={nextEventDate}
            icon={<EventIcon sx={{ fontSize: 32 }} />}
            color="secondary"
          />
          
          {/* Saldo do Caixa - Apenas para Admin e Coordinator */}
          {user?.role !== 'member' && (
            <StatCard
              title="Saldo do Caixa"
              value={formatCurrency(stats.balance)}
              icon={<AccountBalanceIcon sx={{ fontSize: 32 }} />}
              color="success"
            />
          )}
          
          {/* Taxa de Presença - Para todos */}
          <StatCard
            title="Taxa de Presença"
            value={`${stats.attendanceRate}%`}
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="info"
          />
        </Box>

        {/* Avisos Importantes */}
        {stats.nextEvent && (
          <Box>
            <Alert severity="info" sx={{ borderRadius: 3, py: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Próximo encontro: {stats.nextEvent.title}
              </Typography>
              <Typography variant="body2">
                {format(stats.nextEvent.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às{' '}
                {stats.nextEvent.startTime} - {stats.nextEvent.location}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Grid com Próximos Encontros e Atividades Recentes */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr',
            },
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* Próximos Encontros */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Próximos Encontros
            </Typography>
            {upcomingEvents.length > 0 ? (
              <Stack spacing={2}>
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Nenhum evento agendado
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Atividades Recentes */}
          <Box>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Atividades Recentes
              </Typography>
              {recentActivities.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {recentActivities.map((activity, index) => (
                    <Box key={activity.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          alignItems: 'flex-start',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                          {getActivityIcon(activity.icon)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {activity.description}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {format(activity.timestamp, "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma atividade recente
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;

