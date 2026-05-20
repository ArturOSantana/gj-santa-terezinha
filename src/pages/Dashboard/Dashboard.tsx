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

  if (loading) {
    return (
      <Container maxWidth="lg">
        <LoadingSpinner message="Carregando visão geral..." />
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Erro ao carregar dados da visão geral. Por favor, tente novamente.
          </Alert>
        </Box>
      </Container>
    );
  }

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const nextEventDate = stats.nextEvent
    ? format(stats.nextEvent.date, "dd/MM/yyyy", { locale: ptBR })
    : 'Nenhum evento agendado';

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ py: { xs: 1, sm: 2 }, display: 'grid', gap: 3 }}>
        <Box sx={{ pb: 2, borderBottom: '2px solid #1e1e1e' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Visão Geral
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: user?.role === 'member' ? '1fr' : 'repeat(3, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            mb: 1,
          }}
        >
          {user?.role !== 'member' && (
            <StatCard
              title="Total de Membros"
              value={stats.totalMembers}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="primary"
            />
          )}
          
          <StatCard
            title="Próximo Encontro"
            value={nextEventDate}
            icon={<EventIcon sx={{ fontSize: 32 }} />}
            color="secondary"
          />
          
          {user?.role !== 'member' && (
            <StatCard
              title="Saldo do Caixa"
              value={formatCurrency(stats.balance)}
              icon={<AccountBalanceIcon sx={{ fontSize: 32 }} />}
              color="success"
            />
          )}
          
        </Box>

        {stats.nextEvent && (
          <Box>
            <Alert severity="info" sx={{ py: 1, border: '2px solid #1e1e1e' }}>
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
          <Box>
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
                  minHeight: 120,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Nenhum evento agendado
                </Typography>
              </Box>
            )}
          </Box>

          <Box>
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
                  minHeight: 120,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Nenhuma atividade recente
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;

