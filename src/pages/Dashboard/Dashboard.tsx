import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  Stack,
  Grid,
  Avatar,
  Chip,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarMonthIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';
import { differenceInDays, format, getMonth, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDashboard } from '../../hooks/useDashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import EventCard from '../../components/common/EventCard';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestore.service';
import { Member } from '../../types';

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

  const membersRef = (firestoreService as unknown as { data?: { members?: Member[] } })?.data?.members ?? [];
  const birthdayMembers = membersRef
    .filter((member) => member.birthDate && isSameMonth(new Date(member.birthDate), new Date()))
    .slice(0, 4);

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'transaction':
        return <AttachMoneyIcon sx={{ color: '#2d6b4a' }} />;
      case 'member':
        return <PersonIcon sx={{ color: '#7a4b1f' }} />;
      case 'event':
        return <EventIcon sx={{ color: '#8f6a1f' }} />;
      case 'receipt':
        return <ReceiptIcon sx={{ color: '#9a5a13' }} />;
      default:
        return <CheckCircleIcon sx={{ color: '#1a4731' }} />;
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

  const countdownDays = stats.nextEvent
    ? Math.max(differenceInDays(new Date(stats.nextEvent.date), new Date()), 0)
    : null;

  const quickStats = [
    user?.role !== 'member'
      ? {
          title: 'Total de membros',
          value: stats.totalMembers,
          icon: <PeopleIcon sx={{ fontSize: 32 }} />,
          color: 'primary' as const,
        }
      : null,
    {
      title: 'Próximo encontro',
      value: nextEventDate,
      icon: <EventIcon sx={{ fontSize: 32 }} />,
      color: 'secondary' as const,
    },
    user?.role !== 'member'
      ? {
          title: 'Saldo do caixa',
          value: formatCurrency(stats.balance),
          icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
          color: 'success' as const,
        }
      : null,
  ].filter(Boolean);

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ py: { xs: 1.5, sm: 2.5 }, display: 'grid', gap: { xs: 2.5, md: 3.5 } }}>
        <PageHeader
          title="Painel de Controle"
        />

        <Grid container columnSpacing={{ xs: 2, md: 3 }} rowSpacing={{ xs: 2, md: 2.5 }} sx={{ mb: 0.5 }}>
          {quickStats.map((item, index) => (
            <Grid key={item!.title} size={{ xs: 12, sm: index === 1 ? 12 : 6, md: index === 1 ? 5 : 3.5 }}>
              <Box sx={{ mt: index === 1 ? { md: 1.25 } : 0 }}>
                <StatCard
                  title={item!.title}
                  value={item!.value}
                  icon={item!.icon}
                  color={item!.color}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {stats.nextEvent ? (
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 4 },
              borderRadius: { xs: 3, md: 4 },
              color: 'common.white',
              background:
                'linear-gradient(135deg, #163b2b 0%, #24553d 45%, #3b7a57 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(22, 59, 43, 0.22)',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: { xs: 180, md: 240 },
                height: { xs: 180, md: 240 },
                right: { xs: -40, md: -60 },
                top: { xs: -80, md: -110 },
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.09)',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: { xs: 120, md: 160 },
                height: { xs: 120, md: 160 },
                left: { xs: -25, md: -35 },
                bottom: { xs: -50, md: -70 },
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.16)',
              },
            }}
          >
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ position: 'relative', zIndex: 1 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={{ xs: 1.25, md: 1.5 }}>
                  <Chip
                    label="Próximo Encontro"
                    sx={{
                      alignSelf: 'flex-start',
                      bgcolor: 'rgba(255,255,255,0.16)',
                      color: 'common.white',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 24, sm: 28 },
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>
                    <Avatar
                      sx={{
                        width: { xs: 56, sm: 64, md: 72 },
                        height: { xs: 56, sm: 64, md: 72 },
                        bgcolor: 'rgba(255,255,255,0.16)',
                        border: '1px solid rgba(255,255,255,0.18)',
                      }}
                    >
                      <CalendarMonthIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'Merriweather, serif',
                          fontWeight: 700,
                          mb: 0.75,
                          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                          lineHeight: 1.2,
                        }}
                      >
                        {stats.nextEvent.title}
                      </Typography>
                      {stats.nextEvent.description && (
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'rgba(255,255,255,0.82)',
                            maxWidth: 520,
                            fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                            lineHeight: 1.5,
                          }}
                        >
                          {stats.nextEvent.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    ml: { md: 'auto' },
                    maxWidth: 360,
                    p: { xs: 1.75, sm: 2, md: 2.5 },
                    borderRadius: { xs: 2.5, md: 3 },
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      letterSpacing: '0.08em',
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    }}
                  >
                    Contagem regressiva
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {countdownDays ?? '--'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: { xs: 2, md: 2.5 },
                      color: 'rgba(255,255,255,0.82)',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    {countdownDays === 1 ? 'dia para o próximo encontro' : 'dias para o próximo encontro'}
                  </Typography>

                  <Stack spacing={{ xs: 1, md: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.25 } }}>
                      <ScheduleIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#f1d27a', flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        {format(stats.nextEvent.date, "EEEE, dd 'de' MMMM", { locale: ptBR })} • {stats.nextEvent.startTime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.25 } }}>
                      <LocationOnIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#f1d27a', flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          lineHeight: 1.4,
                        }}
                      >
                        {stats.nextEvent.location}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 3 }}>
            <EmptyState
              title="Nenhum encontro agendado"
              description="Quando um novo evento for criado, ele ganhará destaque aqui no painel principal."
            />
          </Paper>
        )}

        <Grid container columnSpacing={{ xs: 2, md: 3.5 }} rowSpacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Atividades recentes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Últimos movimentos do sistema
                  </Typography>
                </Box>

                {recentActivities.length > 0 ? (
                  <Stack spacing={0.5}>
                    {recentActivities.map((activity, index) => (
                      <Box
                        key={activity.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '44px 1fr',
                          gap: 1.5,
                          pb: index === recentActivities.length - 1 ? 0 : 2.25,
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: alpha('#1a4731', index % 2 === 0 ? 0.1 : 0.16),
                            }}
                          >
                            {getActivityIcon(activity.icon)}
                          </Avatar>
                          {index !== recentActivities.length - 1 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 38,
                                width: 2,
                                bottom: -4,
                                bgcolor: alpha('#1a4731', 0.16),
                              }}
                            />
                          )}
                        </Box>

                        <Box
                          sx={{
                            pt: 0.2,
                            pb: 1.6,
                            borderBottom:
                              index === recentActivities.length - 1 ? 'none' : `1px dashed ${alpha('#1a4731', 0.14)}`,
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.4 }}>
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(activity.timestamp, "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="Sem atividades recentes"
                    description="Assim que houver alterações em membros, eventos ou finanças, elas aparecerão aqui."
                  />
                )}
              </Paper>

              <Paper
                sx={{
                  p: { xs: 2, md: 2.75 },
                  borderRadius: 3.5,
                  background: 'linear-gradient(135deg, rgba(184,134,11,0.08) 0%, rgba(255,255,255,1) 60%)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.25 }}>
                  Próximos encontros
                </Typography>
                {upcomingEvents.length > 0 ? (
                  <Stack spacing={2}>
                    {upcomingEvents.map((event, index) => (
                      <Box key={event.id} sx={{ ml: index === 1 ? { md: 1.5 } : 0, mr: index === 2 ? { md: 2 } : 0 }}>
                        <EventCard event={event} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="Agenda vazia por enquanto"
                    description="Cadastre novos encontros para montar a programação dos próximos dias."
                  />
                )}
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  transform: { md: 'translateY(14px)' },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Aniversariantes do mês
                </Typography>

                {birthdayMembers.length > 0 ? (
                  <Stack spacing={1.5}>
                    {birthdayMembers.map((member, index) => (
                      <Box
                        key={member.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: index % 2 === 0 ? alpha('#d4af37', 0.08) : alpha('#1a4731', 0.05),
                        }}
                      >
                        <Avatar sx={{ bgcolor: alpha('#7a4b1f', 0.12), color: '#7a4b1f', fontWeight: 700 }}>
                          {member.name?.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.birthDate
                              ? format(new Date(member.birthDate), "dd 'de' MMMM", { locale: ptBR })
                              : 'Data não informada'}
                          </Typography>
                        </Box>
                        <CakeIcon sx={{ color: '#c69214' }} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="Sem aniversariantes cadastrados"
                    description="Os aniversariantes do mês aparecerão aqui automaticamente."
                  />
                )}
              </Paper>

              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  background: 'linear-gradient(180deg, rgba(26,71,49,0.04) 0%, rgba(26,71,49,0.01) 100%)',
                }}
              >
                <Typography variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', mb: 1 }}>
                  Resumo rápido
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Encontro mais próximo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {stats.nextEvent ? stats.nextEvent.title : 'Nenhum encontro agendado'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Data
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {nextEventDate}
                    </Typography>
                  </Box>
                  {user?.role !== 'member' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Caixa atual
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: stats.balance >= 0 ? 'success.main' : 'error.main' }}>
                        {formatCurrency(stats.balance)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;

