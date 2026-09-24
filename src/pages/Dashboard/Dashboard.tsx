import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Checkbox,
  Button,
  Chip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Schedule as TimeIcon,
  ArrowForward as ArrowIcon,
  WarningAmber as WarningIcon,
  QrCode2 as QrIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TerezinhaService } from '../../services/firestore.service';
import { DashboardStats, Event, Task, Meeting } from '../../types';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastMeeting, setLastMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const st = await TerezinhaService.getDashboardStats();
      const evs = await TerezinhaService.getEvents();
      const ts = await TerezinhaService.getTasks();
      const mts = await TerezinhaService.getMeetings();

      setStats(st);
      setEvents(evs);
      setTasks(ts);
      setLastMeeting(mts[0] || null);
    };

    loadDashboard();
  }, []);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextEvent = upcomingEvents[0] || stats?.nextEvent || null;
  const userName = user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || '';

  const handleToggleEventChecklist = async (eventId: string, itemId: string) => {
    await TerezinhaService.toggleChecklistItem(eventId, itemId);
    const updated = await TerezinhaService.getEvents();
    setEvents(updated);
  };

  const overdueTasks = tasks.filter((t) => t.status === 'overdue' || (t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Saudação de Comando */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 700,
            color: '#f4e6e9',
            fontSize: { xs: '1.8rem', sm: '2.4rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Boa tarde, {userName}.
        </Typography>
      </Box>

      {/* Grid de Cards de Destaque */}
      <Grid container spacing={2.5}>
        {/* COL 1, LINHA 1: Próximo Evento */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              bgcolor: '#2f1522',
              color: '#ffffff',
              borderRadius: '12px',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid rgba(193, 92, 113, 0.4)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: '#f4e6e9',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  display: 'block',
                  mb: 1,
                }}
              >
                PRÓXIMO EVENTO
              </Typography>

              {nextEvent ? (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', sm: '1.65rem' },
                      lineHeight: 1.2,
                      mb: 1.5,
                      color: '#ffffff',
                    }}
                  >
                    {nextEvent.title}
                  </Typography>

                  {nextEvent.description && (
                    <Typography variant="body2" sx={{ color: '#f4e6e9', opacity: 0.9, fontSize: '0.88rem' }}>
                      {nextEvent.description}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ color: '#f4e6e9', opacity: 0.6, mt: 1 }}>
                  Nenhum evento cadastrado.
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                my: 2.5,
                borderBottom: '1px solid rgba(211, 163, 76, 0.15)',
              }}
            />

            {/* Metadados e Ações Rápidas */}
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {nextEvent?.startTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <TimeIcon sx={{ fontSize: 16, color: '#f7efdd' }} />
                    <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      {nextEvent.startTime}
                    </Typography>
                  </Box>
                )}
                {nextEvent?.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <LocationIcon sx={{ fontSize: 16, color: '#f7efdd' }} />
                    <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      {nextEvent.location.split('—')[0]}
                    </Typography>
                  </Box>
                )}
                {nextEvent?.responsibleName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <PersonIcon sx={{ fontSize: 16, color: '#f7efdd' }} />
                    <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 600 }}>
                      {nextEvent.responsibleName}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<QrIcon />}
                  onClick={() => navigate('/p/checkin')}
                  sx={{
                    bgcolor: '#241019',
                    color: '#f4e6e9',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: '#1d0b14' },
                  }}
                >
                  Abrir QR Presença
                </Button>
                {nextEvent && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => {
                      const date = nextEvent.date ? new Date(nextEvent.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
                      const time = nextEvent.startTime ? ` às ${nextEvent.startTime}` : '';
                      const location = nextEvent.location ? ` em ${nextEvent.location.split('—')[0].trim()}` : '';
                      const txt = `*${nextEvent.title}*\nData: ${date}${time}${location}.\nEsperamos por você!`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
                    }}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                    }}
                  >
                    WhatsApp
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* COL 2, LINHA 1: Caixa / Mini-Razão Contábil */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Box
            sx={{
              bgcolor: '#f7efdd',
              color: '#2a1420',
              borderRadius: '16px',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
              border: '1px solid rgba(211, 163, 76, 0.25)',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: '#4a3227',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.72rem',
                }}
              >
                CAIXA ATUAL
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 700,
                  color: '#2a1420',
                  my: 0.5,
                  fontSize: { xs: '1.6rem', sm: '1.9rem' },
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {stats?.balance != null
                  ? stats.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7fa176', fontWeight: 700, display: 'block', mb: 2 }}>
                ● Saldo disponível na tesouraria
              </Typography>

              {stats?.expensesWithoutReceiptTotal != null && stats.expensesWithoutReceiptTotal > 0 && (
                <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 700, display: 'block', mt: 1 }}>
                  ⚠ {stats.expensesWithoutReceiptTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem comprovante
                </Typography>
              )}
            </Box>

            <Button
              size="small"
              onClick={() => navigate('/admin/finance')}
              endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
              sx={{ color: '#9a3450', fontWeight: 700, p: 0, justifyContent: 'flex-start', mt: 2 }}
            >
              Ver tesouraria completa
            </Button>
          </Box>
        </Grid>

        {/* COL 3, LINHA 1: Jovens do Grupo */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Box
            sx={{
              bgcolor: '#f7efdd',
              color: '#2a1420',
              borderRadius: '16px',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
              border: '1px solid rgba(211, 163, 76, 0.25)',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: '#4a3227',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.72rem',
                }}
              >
                JOVENS DO GRUPO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 0.5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Fraunces", Georgia, serif',
                    fontWeight: 700,
                    color: '#2a1420',
                    fontSize: { xs: '2.2rem', sm: '2.6rem' },
                    lineHeight: 1,
                  }}
                >
                  {stats?.totalPeople ?? '—'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4a3227', fontWeight: 600 }}>
                  cadastrados
                </Typography>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {stats?.activePeople != null && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#4f6b4f', fontWeight: 600 }}>
                      ● {stats.activePeople} ativos no mês
                    </Typography>
                    {stats.totalPeople ? (
                      <Typography variant="caption" sx={{ color: '#4a3227' }}>
                        {Math.round((stats.activePeople / stats.totalPeople) * 100)}%
                      </Typography>
                    ) : null}
                  </Box>
                )}
                {stats?.newPeople != null && stats.newPeople > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#d3a34c', fontWeight: 600 }}>
                      ● {stats.newPeople} recém-chegados
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4a3227' }}>novos</Typography>
                  </Box>
                )}
                {stats?.awayPeople != null && stats.awayPeople > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#c15c71', fontWeight: 600 }}>
                      ● {stats.awayPeople} sem presença (+30d)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9a3450', fontWeight: 700 }}>procurar</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Button
              size="small"
              onClick={() => navigate('/admin/people')}
              endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
              sx={{ color: '#9a3450', fontWeight: 700, p: 0, justifyContent: 'flex-start', mt: 2 }}
            >
              Ver cadastro de pessoas
            </Button>
          </Box>
        </Grid>

        {/* COL 1-2, LINHA 2: Linha do Tempo / Próximos Eventos */}
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Box
            sx={{
              bgcolor: '#2f1522',
              color: '#f4e6e9',
              borderRadius: '16px',
              p: 3,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(211, 163, 76, 0.15)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: '"Fraunces", serif',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#f4e6e9',
                }}
              >
                Linha do Tempo do Semestre
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/admin/events')}
                sx={{ color: '#d3a34c', fontSize: '0.75rem', fontWeight: 700 }}
              >
                Ver todos os eventos →
              </Button>
            </Box>

            {upcomingEvents.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between' }}>
                {upcomingEvents.slice(0, 4).map((evt, idx) => (
                  <Box
                    key={evt.id}
                    onClick={() => navigate('/admin/events')}
                    sx={{
                      flex: 1,
                      bgcolor: '#241019',
                      p: 2,
                      borderRadius: 2,
                      border: idx === 0 ? '1px solid #c15c71' : '1px solid rgba(211, 163, 76, 0.15)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: idx === 0 ? '#c15c71' : '#d3a34c',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#e2cad2', fontWeight: 700, fontSize: '0.72rem' }}>
                        {evt.date
                          ? new Date(evt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                          : ''}
                        {evt.startTime ? ` • ${evt.startTime}` : ''}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: '"Fraunces", serif',
                        fontWeight: 600,
                        color: '#f4e6e9',
                        fontSize: '0.95rem',
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {evt.title.split('—')[0]}
                    </Typography>
                    {evt.location && (
                      <Typography variant="caption" sx={{ color: '#e2cad2', fontSize: '0.72rem' }}>
                        {evt.location.split('—')[0]}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#f4e6e9', opacity: 0.5 }}>
                Nenhum evento cadastrado ainda.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* COL 3, LINHA 2: Avisos e Pendências da Coordenação */}
        <Grid size={{ xs: 12, md: 4.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            {/* Card 1: Tarefas atrasadas */}
            <Box
              sx={{
                bgcolor: '#2f1522',
                color: '#f4e6e9',
                p: 2,
                borderRadius: '10px',
                borderLeft: '4px solid #d3a34c',
                borderTop: '1px solid rgba(211, 163, 76, 0.12)',
                borderRight: '1px solid rgba(211, 163, 76, 0.12)',
                borderBottom: '1px solid rgba(211, 163, 76, 0.12)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: '#381c2b' },
              }}
              onClick={() => navigate('/admin/tasks')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ color: '#d3a34c', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f4e6e9', fontSize: '0.88rem' }}>
                  {overdueTasks.length > 0
                    ? `${overdueTasks.length} tarefa${overdueTasks.length > 1 ? 's' : ''} atrasada${overdueTasks.length > 1 ? 's' : ''}`
                    : 'Nenhuma tarefa atrasada'}
                </Typography>
              </Box>
              {overdueTasks.length > 0 && (
                <Typography variant="caption" sx={{ color: '#e2cad2', display: 'block', mt: 0.4 }}>
                  {overdueTasks.slice(0, 2).map((t) => t.title).join(' • ')}
                  {overdueTasks.length > 2 ? ` e mais ${overdueTasks.length - 2}` : ''}
                </Typography>
              )}
            </Box>

            {/* Card 2: Pendências financeiras */}
            <Box
              sx={{
                bgcolor: '#2f1522',
                color: '#f4e6e9',
                p: 2,
                borderRadius: '10px',
                borderLeft: '4px solid #c15c71',
                borderTop: '1px solid rgba(211, 163, 76, 0.12)',
                borderRight: '1px solid rgba(211, 163, 76, 0.12)',
                borderBottom: '1px solid rgba(211, 163, 76, 0.12)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: '#381c2b' },
              }}
              onClick={() => navigate('/admin/finance')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ color: '#c15c71', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f4e6e9', fontSize: '0.88rem' }}>
                  {stats?.expensesWithoutReceiptTotal != null && stats.expensesWithoutReceiptTotal > 0
                    ? `${stats.expensesWithoutReceiptTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem comprovante`
                    : 'Sem pendências financeiras'}
                </Typography>
              </Box>
            </Box>

            {/* Card 3: Próximo evento — inscrições */}
            {nextEvent && (
              <Box
                sx={{
                  bgcolor: '#2f1522',
                  color: '#f4e6e9',
                  p: 2,
                  borderRadius: '10px',
                  borderLeft: '4px solid #7fa176',
                  borderTop: '1px solid rgba(211, 163, 76, 0.12)',
                  borderRight: '1px solid rgba(211, 163, 76, 0.12)',
                  borderBottom: '1px solid rgba(211, 163, 76, 0.12)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: '#381c2b' },
                }}
                onClick={() => navigate('/admin/events')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: '#7fa176', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f4e6e9', fontSize: '0.88rem' }}>
                    {nextEvent.title}
                    {nextEvent.maxParticipants != null
                      ? ` • ${nextEvent.maxParticipants} vagas`
                      : ''}
                  </Typography>
                </Box>
                {nextEvent.date && (
                  <Typography variant="caption" sx={{ color: '#e2cad2', display: 'block', mt: 0.4 }}>
                    {new Date(nextEvent.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    {nextEvent.startTime ? ` • ${nextEvent.startTime}` : ''}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Grid>

        {/* LINHA INFERIOR (2 COLUNAS): Checklist do Próximo Evento + Última Reunião */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: '#f7efdd',
              color: '#2a1420',
              p: 3,
              borderRadius: '16px',
              border: '1px solid rgba(211, 163, 76, 0.25)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                {nextEvent?.title ? `Organização — ${nextEvent.title}` : 'Organização'}
              </Typography>
              <Chip label="Checklist" size="small" sx={{ bgcolor: '#efe2c4', fontWeight: 700, color: '#4a3227' }} />
            </Box>

            {nextEvent?.checklist && nextEvent.checklist.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {nextEvent.checklist.map((item) => (
                  <Box
                    key={item.id}
                    onClick={() => handleToggleEventChecklist(nextEvent.id, item.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 0.8,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#efe2c4' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        size="small"
                        checked={item.completed}
                        sx={{
                          color: '#4a3227',
                          p: 0,
                          '&.Mui-checked': { color: '#7fa176' },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: item.completed ? '#4a3227' : '#2a1420',
                          textDecoration: item.completed ? 'line-through' : 'none',
                          fontWeight: item.completed ? 400 : 600,
                          fontSize: '0.88rem',
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    {item.assignedTo && (
                      <Chip
                        label={item.assignedTo}
                        size="small"
                        sx={{ bgcolor: '#efe2c4', color: '#4a3227', fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#4a3227', opacity: 0.6 }}>
                Nenhum item no checklist deste evento.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* ÚLTIMA REUNIÃO DE LIDERANÇA */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: '#f7efdd',
              color: '#2a1420',
              p: 3,
              borderRadius: '16px',
              border: '1px solid rgba(211, 163, 76, 0.25)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                Última Reunião da Coordenação
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/meetings')} sx={{ color: '#9a3450', fontSize: '0.75rem', fontWeight: 700 }}>
                Ver atas →
              </Button>
            </Box>

            {lastMeeting ? (
              <>
                <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 700, display: 'block', mb: 1.5 }}>
                  {lastMeeting.date
                    ? new Date(lastMeeting.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : ''}
                  {lastMeeting.attendees?.length
                    ? ` • Presenças: ${lastMeeting.attendees.join(', ')}`
                    : ''}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {lastMeeting.decisions?.map((d, i) => (
                    <Typography key={i} variant="body2" sx={{ color: '#2a1420', fontSize: '0.88rem' }}>
                      <strong>Decidido:</strong> {d.text}
                    </Typography>
                  ))}
                  {lastMeeting.generatedTasks && lastMeeting.generatedTasks.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(107, 83, 71, 0.15)' }}>
                      <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        TAREFAS GERADAS:
                      </Typography>
                      {lastMeeting.generatedTasks.map((t, i) => (
                        <Typography key={i} variant="caption" sx={{ color: '#2a1420', display: 'block' }}>
                          • <strong>{t.assignedTo}:</strong> {t.taskTitle}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: '#4a3227', opacity: 0.6 }}>
                Nenhuma reunião registrada ainda.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
