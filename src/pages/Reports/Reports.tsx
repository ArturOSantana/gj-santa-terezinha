import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TerezinhaService } from '../../services/firestore.service';
import { Event, Task, TaskStatus, TaskPriority } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/constants';

// ─── Paleta do tema ────────────────────────────────────────────────────────────
const ROSE = '#c15c71';
const GOLD = '#d3a34c';
const SAGE = '#7fa176';
const SURFACE = '#2f1522';
const TEXT_MAIN = '#f4e6e9';
const TEXT_DIM = '#e2cad2';

const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  [TaskPriority.LOW]: { label: 'Baixa', color: SAGE },
  [TaskPriority.MEDIUM]: { label: 'Média', color: GOLD },
  [TaskPriority.HIGH]: { label: 'Alta', color: ROSE },
  [TaskPriority.URGENT]: { label: 'Urgente', color: '#ff5252' },
};

const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  [TaskStatus.PENDING]: { label: 'Pendente', color: GOLD },
  [TaskStatus.IN_PROGRESS]: { label: 'Em andamento', color: '#64b5f6' },
  [TaskStatus.COMPLETED]: { label: 'Concluída', color: SAGE },
  [TaskStatus.CANCELLED]: { label: 'Cancelada', color: '#9e9e9e' },
};

type PeriodOption = '1m' | '3m' | '6m' | '12m';

// ─── Componente Stat Card ──────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, accent = ROSE }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      bgcolor: SURFACE,
      border: `1px solid rgba(211,163,76,0.12)`,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: '12px',
        bgcolor: `${accent}22`,
        border: `1px solid ${accent}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: accent,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: TEXT_DIM, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography sx={{ color: TEXT_MAIN, fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, fontFamily: '"Fraunces", serif' }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ color: TEXT_DIM, fontSize: '0.72rem', mt: 0.3 }}>{sub}</Typography>
      )}
    </Box>
  </Paper>
);

// ─── Seção com título ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="h6"
      sx={{
        fontFamily: '"Fraunces", serif',
        color: TEXT_MAIN,
        fontWeight: 700,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&::after': { content: '""', flex: 1, height: 1, bgcolor: 'rgba(211,163,76,0.15)', display: 'block' },
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

// ─── Tooltip customizado ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, bgcolor: '#1d0b14', border: '1px solid rgba(211,163,76,0.3)', borderRadius: 1.5 }}>
      <Typography sx={{ color: GOLD, fontSize: '0.78rem', fontWeight: 700, mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any) => (
        <Typography key={p.dataKey} sx={{ color: TEXT_DIM, fontSize: '0.78rem' }}>
          <span style={{ color: p.fill || p.color }}>■</span> {p.name ?? p.dataKey}: <strong style={{ color: TEXT_MAIN }}>{p.value}</strong>
        </Typography>
      ))}
    </Paper>
  );
};

// ─── Página Principal ──────────────────────────────────────────────────────────
const ReportsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodOption>('6m');

  const load = useCallback(async () => {
    setLoading(true);
    const [evs, tks] = await Promise.all([TerezinhaService.getEvents(), TerezinhaService.getTasks()]);
    setEvents(evs);
    setTasks(tks);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtro por período ──────────────────────────────────────────────────────
  const monthsBack = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - monthsBack);
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date();

  const filteredEvents = events.filter(
    (e) => new Date(e.date) >= periodStart && new Date(e.date) <= periodEnd
  );

  // ── Eventos por categoria (barra) ───────────────────────────────────────────
  const eventsByCategoryData = Object.entries(EVENT_CATEGORIES).map(([key, meta]) => ({
    name: meta.label,
    total: filteredEvents.filter((e) => e.category === key).length,
    color: meta.color,
  })).filter((d) => d.total > 0).sort((a, b) => b.total - a.total);

  // ── Eventos por mês (linha) ─────────────────────────────────────────────────
  const monthsRange: { key: string; label: string }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthsRange.push({
      key: `${getYear(d)}-${String(getMonth(d) + 1).padStart(2, '0')}`,
      label: format(d, 'MMM/yy', { locale: ptBR }),
    });
  }

  const eventsPerMonth = monthsRange.map(({ key, label }) => {
    const [y, m] = key.split('-').map(Number);
    const count = filteredEvents.filter((e) => {
      const ed = new Date(e.date);
      return getYear(ed) === y && getMonth(ed) + 1 === m;
    }).length;
    return { label, Eventos: count };
  });

  // ── Distribuição por categoria (pizza) ─────────────────────────────────────
  const pieData = eventsByCategoryData.map((d) => ({ name: d.name, value: d.total, color: d.color }));

  // ── Tarefas stats ────────────────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const urgentPending = tasks.filter(
    (t) => t.priority === TaskPriority.URGENT && t.status !== TaskStatus.COMPLETED
  ).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tarefas por prioridade
  const tasksByPriority = Object.values(TaskPriority).map((p) => ({
    name: PRIORITY_META[p].label,
    total: tasks.filter((t) => t.priority === p).length,
    color: PRIORITY_META[p].color,
  })).filter((d) => d.total > 0);

  // Tarefas por status
  const tasksByStatus = Object.values(TaskStatus).map((s) => ({
    name: STATUS_META[s].label,
    value: tasks.filter((t) => t.status === s).length,
    color: STATUS_META[s].color,
  })).filter((d) => d.value > 0);

  // ── Próximos eventos (30 dias) ──────────────────────────────────────────────
  const now = new Date();
  const next30 = new Date();
  next30.setDate(now.getDate() + 30);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= now && new Date(e.date) <= next30)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  // ── Tarefas urgentes / vencendo ─────────────────────────────────────────────
  const overdueTasks = tasks.filter(
    (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED && new Date(t.dueDate) < now
  );
  const dueSoonTasks = tasks.filter(
    (t) => {
      const d = new Date(t.dueDate);
      const in7 = new Date();
      in7.setDate(now.getDate() + 7);
      return t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED && d >= now && d <= in7;
    }
  );

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: ROSE }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6 }}>
      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: TEXT_MAIN, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrendingIcon sx={{ color: ROSE, fontSize: 32 }} /> Relatório de Atividades
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, v) => v && setPeriod(v)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: TEXT_DIM,
                borderColor: 'rgba(211,163,76,0.2)',
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.5,
                '&.Mui-selected': { bgcolor: `${ROSE}33`, color: ROSE, borderColor: ROSE },
              },
            }}
          >
            <ToggleButton value="1m">1 mês</ToggleButton>
            <ToggleButton value="3m">3 meses</ToggleButton>
            <ToggleButton value="6m">6 meses</ToggleButton>
            <ToggleButton value="12m">12 meses</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Recarregar dados">
            <IconButton onClick={load} size="small" sx={{ color: TEXT_DIM }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir relatório">
            <IconButton onClick={handlePrint} size="small" sx={{ color: TEXT_DIM }}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── KPIs ── */}
      <Section title="Resumo Geral">
        <Grid container spacing={2} sx={{ mb: 0 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<EventNoteIcon />}
              label="Eventos no período"
              value={filteredEvents.length}
              sub={`últimos ${monthsBack} meses`}
              accent={ROSE}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<CalendarIcon />}
              label="Próximos 30 dias"
              value={upcomingEvents.length}
              sub="eventos agendados"
              accent={GOLD}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<AssignmentIcon />}
              label="Total de tarefas"
              value={totalTasks}
              sub={`${completionRate}% concluídas`}
              accent="#64b5f6"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<CheckCircleIcon />}
              label="Tarefas concluídas"
              value={completedTasks}
              sub={`${pendingTasks} pendentes`}
              accent={SAGE}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard
              icon={<WarningIcon />}
              label="Tarefas vencidas"
              value={overdueTasks.length}
              sub={`${urgentPending} urgentes`}
              accent="#ff5252"
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── Gráficos de Eventos ── */}
      <Section title="Eventos do Calendário">
        <Grid container spacing={3}>
          {/* Eventos por mês - linha */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}
            >
              <Typography sx={{ color: TEXT_MAIN, fontWeight: 700, fontSize: '0.88rem', mb: 2 }}>
                Eventos por mês
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={eventsPerMonth} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Eventos"
                    stroke={ROSE}
                    strokeWidth={2.5}
                    dot={{ fill: ROSE, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: GOLD }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Pizza de categorias */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}
            >
              <Typography sx={{ color: TEXT_MAIN, fontWeight: 700, fontSize: '0.88rem', mb: 2 }}>
                Distribuição por categoria
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '0.72rem', color: TEXT_DIM, paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                  <Typography sx={{ color: TEXT_DIM, fontSize: '0.85rem' }}>Sem eventos no período</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Barras por categoria */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}
            >
              <Typography sx={{ color: TEXT_MAIN, fontWeight: 700, fontSize: '0.88rem', mb: 2 }}>
                Total por categoria de evento
              </Typography>
              {eventsByCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={eventsByCategoryData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Eventos" radius={[4, 4, 0, 0]}>
                      {eventsByCategoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: TEXT_DIM, fontSize: '0.85rem', textAlign: 'center', py: 4 }}>
                  Sem eventos no período selecionado
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Section>

      {/* ── Próximos eventos ── */}
      <Section title="Próximos Eventos (30 dias)">
        {upcomingEvents.length > 0 ? (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: TEXT_DIM, fontSize: '0.75rem', fontWeight: 700, borderColor: 'rgba(211,163,76,0.1)', pb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                  <TableCell>Data</TableCell>
                  <TableCell>Evento</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Horário</TableCell>
                  <TableCell>Local</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingEvents.map((ev) => {
                  const catMeta = EVENT_CATEGORIES[ev.category as keyof typeof EVENT_CATEGORIES];
                  const daysUntil = Math.ceil((new Date(ev.date).getTime() - now.getTime()) / 86400000);
                  return (
                    <TableRow
                      key={ev.id}
                      sx={{
                        '& td': { borderColor: 'rgba(211,163,76,0.08)', color: TEXT_DIM, fontSize: '0.82rem', py: 1.2 },
                        '&:hover': { bgcolor: 'rgba(193,92,113,0.06)' },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography sx={{ color: TEXT_MAIN, fontSize: '0.82rem', fontWeight: 600 }}>
                            {format(new Date(ev.date), "dd/MM", { locale: ptBR })}
                          </Typography>
                          <Typography sx={{ color: daysUntil <= 3 ? '#ff5252' : GOLD, fontSize: '0.7rem' }}>
                            {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `em ${daysUntil} dias`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: `${TEXT_MAIN} !important`, fontWeight: '600 !important' }}>
                        {ev.title}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={catMeta?.label ?? ev.category}
                          size="small"
                          sx={{
                            bgcolor: `${catMeta?.color ?? ROSE}22`,
                            color: catMeta?.color ?? ROSE,
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            height: 20,
                            border: `1px solid ${catMeta?.color ?? ROSE}44`,
                          }}
                        />
                      </TableCell>
                      <TableCell>{ev.startTime} – {ev.endTime}</TableCell>
                      <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.location || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper elevation={0} sx={{ p: 4, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2, textAlign: 'center' }}>
            <Typography sx={{ color: TEXT_DIM }}>Nenhum evento nos próximos 30 dias</Typography>
          </Paper>
        )}
      </Section>

      {/* ── Análise de Tarefas ── */}
      <Section title="Análise de Tarefas">
        <Grid container spacing={3}>
          {/* Barra de progresso geral */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ color: TEXT_MAIN, fontWeight: 700, fontSize: '0.9rem' }}>
                  Taxa de conclusão geral
                </Typography>
                <Typography sx={{ color: completionRate >= 70 ? SAGE : completionRate >= 40 ? GOLD : ROSE, fontWeight: 800, fontSize: '1.3rem', fontFamily: '"Fraunces", serif' }}>
                  {completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    bgcolor: completionRate >= 70 ? SAGE : completionRate >= 40 ? GOLD : ROSE,
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 3, mt: 1.5, flexWrap: 'wrap' }}>
                {[
                  { label: 'Concluídas', value: completedTasks, color: SAGE },
                  { label: 'Em andamento', value: inProgressTasks, color: '#64b5f6' },
                  { label: 'Pendentes', value: pendingTasks, color: GOLD },
                  { label: 'Vencidas', value: overdueTasks.length, color: '#ff5252' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography sx={{ color: TEXT_DIM, fontSize: '0.78rem' }}>
                      {item.label}: <strong style={{ color: item.color }}>{item.value}</strong>
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Tarefas por prioridade */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}>
              <Typography sx={{ color: TEXT_MAIN, fontWeight: 700, fontSize: '0.88rem', mb: 2 }}>
                Tarefas por prioridade
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByPriority} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: TEXT_DIM, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Tarefas" radius={[0, 4, 4, 0]}>
                    {tasksByPriority.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Tarefas por status */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}>
              <Typography sx={{ color: TEXT_MAIN, fontWeight: 700, fontSize: '0.88rem', mb: 2 }}>
                Distribuição por status
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                    {tasksByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.72rem', color: TEXT_DIM }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Section>

      {/* ── Tarefas com atenção ── */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <Section title="Tarefas que Precisam de Atenção">
          <Grid container spacing={2.5}>
            {/* Vencidas */}
            {overdueTasks.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ bgcolor: SURFACE, border: `1px solid #ff525244`, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#ff525218', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon sx={{ color: '#ff5252', fontSize: 18 }} />
                    <Typography sx={{ color: '#ff5252', fontWeight: 700, fontSize: '0.85rem' }}>
                      Vencidas ({overdueTasks.length})
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {overdueTasks.slice(0, 5).map((t) => (
                      <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: PRIORITY_META[t.priority]?.color ?? ROSE, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ color: TEXT_MAIN, fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.title}
                          </Typography>
                          <Typography sx={{ color: '#ff5252', fontSize: '0.7rem' }}>
                            Venceu {format(new Date(t.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                          </Typography>
                        </Box>
                        <Chip
                          label={PRIORITY_META[t.priority]?.label}
                          size="small"
                          sx={{ bgcolor: `${PRIORITY_META[t.priority]?.color}22`, color: PRIORITY_META[t.priority]?.color, fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                        />
                      </Box>
                    ))}
                    {overdueTasks.length > 5 && (
                      <Typography sx={{ color: TEXT_DIM, fontSize: '0.75rem', textAlign: 'center', py: 0.5 }}>
                        + {overdueTasks.length - 5} outras tarefas vencidas
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Vencendo em breve */}
            {dueSoonTasks.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ bgcolor: SURFACE, border: `1px solid ${GOLD}44`, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: `${GOLD}18`, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PendingIcon sx={{ color: GOLD, fontSize: 18 }} />
                    <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: '0.85rem' }}>
                      Vencendo em 7 dias ({dueSoonTasks.length})
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {dueSoonTasks.slice(0, 5).map((t) => (
                      <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: PRIORITY_META[t.priority]?.color ?? GOLD, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ color: TEXT_MAIN, fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.title}
                          </Typography>
                          <Typography sx={{ color: GOLD, fontSize: '0.7rem' }}>
                            {format(new Date(t.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                            {t.assignedToName ? ` · ${t.assignedToName}` : ''}
                          </Typography>
                        </Box>
                        <Chip
                          label={PRIORITY_META[t.priority]?.label}
                          size="small"
                          sx={{ bgcolor: `${PRIORITY_META[t.priority]?.color}22`, color: PRIORITY_META[t.priority]?.color, fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                        />
                      </Box>
                    ))}
                    {dueSoonTasks.length > 5 && (
                      <Typography sx={{ color: TEXT_DIM, fontSize: '0.75rem', textAlign: 'center', py: 0.5 }}>
                        + {dueSoonTasks.length - 5} outras tarefas
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Section>
      )}

      {/* ── Listagem completa de tarefas ── */}
      <Section title="Todas as Tarefas">
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ bgcolor: SURFACE, border: '1px solid rgba(211,163,76,0.12)', borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: TEXT_DIM, fontSize: '0.75rem', fontWeight: 700, borderColor: 'rgba(211,163,76,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                <TableCell>Tarefa</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', color: TEXT_DIM, py: 4, borderColor: 'rgba(211,163,76,0.08)' }}>
                    Nenhuma tarefa cadastrada
                  </TableCell>
                </TableRow>
              )}
              {tasks.map((t) => {
                const isOverdue = t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED && new Date(t.dueDate) < now;
                const pMeta = PRIORITY_META[t.priority];
                const sMeta = STATUS_META[t.status];
                return (
                  <TableRow
                    key={t.id}
                    sx={{
                      '& td': { borderColor: 'rgba(211,163,76,0.08)', color: TEXT_DIM, fontSize: '0.82rem', py: 1.1 },
                      '&:hover': { bgcolor: 'rgba(193,92,113,0.05)' },
                      opacity: t.status === TaskStatus.CANCELLED ? 0.5 : 1,
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ color: TEXT_MAIN, fontSize: '0.82rem', fontWeight: 600 }}>
                        {t.title}
                      </Typography>
                      {t.eventTitle && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                          <EventNoteIcon sx={{ fontSize: 12, color: TEXT_DIM }} />
                          <Typography sx={{ color: TEXT_DIM, fontSize: '0.7rem' }}>{t.eventTitle}</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{t.assignedToName || '—'}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: isOverdue ? '#ff5252' : TEXT_DIM, fontSize: '0.82rem', fontWeight: isOverdue ? 700 : 400, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        {format(new Date(t.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                        {isOverdue && <WarningIcon sx={{ fontSize: 14, color: '#ff5252' }} />}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pMeta?.label}
                        size="small"
                        sx={{ bgcolor: `${pMeta?.color}22`, color: pMeta?.color, fontWeight: 700, fontSize: '0.68rem', height: 20, border: `1px solid ${pMeta?.color}44` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sMeta?.label}
                        size="small"
                        sx={{ bgcolor: `${sMeta?.color}22`, color: sMeta?.color, fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      {/* ── Rodapé ── */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(211,163,76,0.12)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={{ color: TEXT_DIM, fontSize: '0.75rem' }}>
          GJ Santa Terezinha — Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Typography>
        <Typography sx={{ color: TEXT_DIM, fontSize: '0.75rem' }}>
          {filteredEvents.length} eventos · {tasks.length} tarefas
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportsPage;
