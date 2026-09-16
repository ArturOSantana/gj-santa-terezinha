import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  CheckCircle as CheckIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  FormatListBulleted as ListIcon,
  Group as TeamIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { Event, EventCategory, EventRegistration, RegistrationSourceProvider } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';
import { EVENT_CATEGORIES, EVENT_CATEGORY_OPTIONS } from '../../utils/constants';

export const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Exclusão de evento
  const [deleteEventTarget, setDeleteEventTarget] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Adicionar membro à equipe
  const [openTeamModal, setOpenTeamModal] = useState(false);
  const [teamMemberName, setTeamMemberName] = useState('');
  const [teamMemberRole, setTeamMemberRole] = useState('');
  const [savingTeam, setSavingTeam] = useState(false);

  const canCreate = user ? hasPermission(user.role, 'leader') : false;

  // Form New Event
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('Paróquia Santa Terezinha');
  const [newCategory, setNewCategory] = useState<EventCategory>(EventCategory.MEETING);
  const [newMax, setNewMax] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const list = await TerezinhaService.getEvents();
    setEvents(list);
    if (list.length > 0 && !selectedEvent) {
      setSelectedEvent(list[0]);
      loadRegistrations(list[0].id);
    }
  };

  const loadRegistrations = async (eventId: string) => {
    const regs = await TerezinhaService.getRegistrationsByEvent(eventId);
    setRegistrations(regs);
  };

  const handleSelectEvent = (evt: Event) => {
    setSelectedEvent(evt);
    loadRegistrations(evt.id);
    setTabIndex(0);
  };

  const handleSyncSheets = async () => {
    if (!selectedEvent) return;
    setSyncing(true);
    await TerezinhaService.syncGoogleSheets(selectedEvent.id);
    await loadRegistrations(selectedEvent.id);
    setTimeout(() => setSyncing(false), 600);
  };

  const handleShareWhatsApp = (evt: Event) => {
    const link = `${window.location.origin}/p/${evt.publicSlug || evt.id}`;
    const text = `*${evt.title}*\n${evt.themeVerse ? `_${evt.themeVerse}_\n` : ''}\nData: ${new Date(evt.date).toLocaleDateString('pt-BR')}\nValor: ${evt.price ? `R$ ${evt.price}` : 'Gratuito'}\n\nInscrições e detalhes:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || saving) return;
    setSaving(true);

    // Parsear a data como local (evita que "2025-07-15" vire UTC midnight e apareça como 14/07 no Brasil)
    const parsedDate = (() => {
      if (!newDate) return new Date();
      const [y, m, d] = newDate.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0, 0);
    })();
    const created = await TerezinhaService.createEvent({
      title: newTitle,
      description: '',
      date: parsedDate,
      startTime: '19:00',
      endTime: '21:00',
      location: newLocation,
      category: newCategory,
      responsibleName: user?.displayName || '',
      isPublic: true,
      publicSlug: newTitle.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      maxParticipants: newMax ? Number(newMax) : undefined,
      price: newPrice ? Number(newPrice) : undefined,
      checklist: [],
      teams: [],
    });

    setOpenNewModal(false);
    setSaving(false);
    setNewTitle('');
    setNewDate('');
    setNewLocation('Paróquia Santa Terezinha');
    setNewCategory(EventCategory.MEETING);
    setNewMax('');
    setNewPrice('');
    await loadEvents();
    handleSelectEvent(created);
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventTarget) return;
    setDeletingEvent(true);
    await TerezinhaService.deleteEvent(deleteEventTarget.id);
    setDeletingEvent(false);
    setDeleteEventTarget(null);
    setSelectedEvent(null);
    await loadEvents();
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !teamMemberName || !teamMemberRole) return;
    setSavingTeam(true);
    const currentTeams = selectedEvent.teams || [];
    await TerezinhaService.updateEvent(selectedEvent.id, {
      teams: [
        ...currentTeams,
        { personName: teamMemberName, role: teamMemberRole, status: 'pending' },
      ],
    });
    setTeamMemberName('');
    setTeamMemberRole('');
    setOpenTeamModal(false);
    setSavingTeam(false);
    await loadEvents();
    const updated = await TerezinhaService.getEventBySlug(selectedEvent.id);
    if (updated) setSelectedEvent(updated);
  };

  // Métricas do Evento Selecionado
  const max = selectedEvent?.maxParticipants || 0;
  const totalRegs = registrations.length;
  const confirmedRegs = registrations.filter((r) => r.confirmed || r.paymentStatus === 'paid').length;
  const pendingRegs = totalRegs - confirmedRegs;

  const price = selectedEvent?.price || 0;
  const expectedTotal = max > 0 ? max * price : totalRegs * price;
  const receivedTotal = registrations.reduce((acc, r) => acc + (r.amountPaid || 0), 0);
  const pendingTotal = Math.max(0, expectedTotal - receivedTotal);
  const estimatedBalance = receivedTotal;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Eventos & Inscrições
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewModal(true)}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Criar Evento
          </Button>
        )}
      </Box>

      {/* Grid Principal: Seletor de Eventos (Esquerda) + Detalhe 360° (Direita) */}
      <Grid container spacing={3}>
        {/* Lista Lateral de Eventos */}
        <Grid size={{ xs: 12, md: 4 }}>
          {events.length === 0 ? (
            <Box sx={{ p: 3, bgcolor: '#2f1522', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(211, 163, 76, 0.2)' }}>
              <Typography variant="body2" sx={{ color: '#e2cad2' }}>
                Nenhum evento cadastrado no momento.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {events.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <Box
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt)}
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      bgcolor: isSelected ? '#2f1522' : '#f7efdd',
                      color: isSelected ? '#f4e6e9' : '#2a1420',
                      border: isSelected ? '2px solid #d3a34c' : '1px solid rgba(211, 163, 76, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Chip
                          label={EVENT_CATEGORIES[evt.category as keyof typeof EVENT_CATEGORIES]?.label ?? evt.category}
                          size="small"
                        sx={{
                          bgcolor: isSelected ? 'rgba(211, 163, 76, 0.2)' : '#efe2c4',
                          color: isSelected ? '#d3a34c' : '#4a3227',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: isSelected ? '#e2cad2' : '#4a3227', fontWeight: 600 }}>
                        {new Date(evt.date).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: '"Fraunces", serif',
                        fontWeight: 700,
                        mt: 1,
                        fontSize: '1.1rem',
                        color: isSelected ? '#f4e6e9' : '#2a1420',
                      }}
                    >
                      {evt.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: isSelected ? '#e2cad2' : '#4a3227', display: 'block', mt: 0.5 }}
                    >
                      {evt.location} • {evt.price ? `R$ ${evt.price}` : 'Gratuito'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Grid>

        {/* Detalhe 360° do Evento Selecionado */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selectedEvent ? (
            <Box
              sx={{
                bgcolor: '#f7efdd',
                color: '#2a1420',
                borderRadius: '16px',
                p: 3.5,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: '1px solid rgba(211, 163, 76, 0.3)',
              }}
            >
              {/* Header do Evento Selecionado */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                    {selectedEvent.title}
                  </Typography>
                  {selectedEvent.themeVerse && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#c15c71', fontWeight: 600, mt: 0.3 }}>
                      {selectedEvent.themeVerse}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 14, color: '#c15c71' }} />
                      <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                        {new Date(selectedEvent.date).toLocaleDateString('pt-BR')} {selectedEvent.endDate && `→ ${new Date(selectedEvent.endDate).toLocaleDateString('pt-BR')}`}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#4a3227' }}>•</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 14, color: '#c15c71' }} />
                      <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                        {selectedEvent.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Ações de Compartilhamento / Link Público */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShareWhatsApp(selectedEvent)}
                    sx={{ borderColor: '#7fa176', color: '#4f6b4f', fontWeight: 700, textTransform: 'none' }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={() => window.open(`/p/${selectedEvent.publicSlug || selectedEvent.id}`, '_blank')}
                    sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#9a3450' } }}
                  >
                    Página Pública
                  </Button>
                  {canCreate && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteEventTarget(selectedEvent)}
                      sx={{ borderColor: '#c15c71', color: '#c15c71', fontWeight: 700, textTransform: 'none' }}
                    >
                      Excluir
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Tabs de Seções */}
              <Tabs
                value={tabIndex}
                onChange={(_, val) => setTabIndex(val)}
                sx={{
                  borderBottom: '1px solid rgba(107, 83, 71, 0.2)',
                  mb: 3,
                  '& .MuiTab-root': { color: '#4a3227', fontWeight: 700, textTransform: 'none' },
                  '& .Mui-selected': { color: '#c15c71' },
                  '& .MuiTabs-indicator': { bgcolor: '#c15c71' },
                }}
              >
                <Tab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={max > 0 ? `Inscritos (${totalRegs}/${max})` : `Inscritos (${totalRegs})`} />
                <Tab icon={<MoneyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Financeiro" />
                <Tab icon={<ListIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Organização (${(selectedEvent.checklist || []).length})`} />
                <Tab icon={<TeamIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Equipe (${(selectedEvent.teams || []).length})`} />
              </Tabs>

              {/* TAB 0: INSCRITOS */}
              {tabIndex === 0 && (
                <Box>
                  {/* Barra de Integração com Google Forms / Sheets */}
                  <Box
                    sx={{
                      bgcolor: '#efe2c4',
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2.5,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2a1420' }}>
                        Origem: {selectedEvent.registrationSource?.provider === RegistrationSourceProvider.GOOGLE_FORMS ? 'Google Forms & Sheets' : 'Página Pública Direta'}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SyncIcon />}
                      onClick={handleSyncSheets}
                      disabled={syncing}
                      sx={{ borderColor: '#4a3227', color: '#2a1420', fontWeight: 700 }}
                    >
                      {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
                    </Button>
                  </Box>

                  {/* Resumo Rápido de Inscrições */}
                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid rgba(107, 83, 71, 0.15)' }}>
                        <Typography variant="caption" sx={{ color: '#4a3227' }}>{max > 0 ? 'Vagas Preenchidas' : 'Total de Inscritos'}</Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                          {max > 0 ? `${totalRegs} / ${max}` : totalRegs}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid rgba(107, 83, 71, 0.15)' }}>
                        <Typography variant="caption" sx={{ color: '#4f6b4f' }}>Confirmados</Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#4f6b4f' }}>
                          {confirmedRegs}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid rgba(107, 83, 71, 0.15)' }}>
                        <Typography variant="caption" sx={{ color: '#d3a34c' }}>Pendentes</Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#d3a34c' }}>
                          {pendingRegs}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Tabela de Inscritos */}
                  <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                    {registrations.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4a3227', opacity: 0.8 }}>
                          Nenhuma inscrição recebida ainda para este evento.
                        </Typography>
                      </Box>
                    ) : (
                      registrations.map((reg) => (
                        <Box
                          key={reg.id}
                          sx={{
                            p: 1.5,
                            borderBottom: '1px solid rgba(107, 83, 71, 0.15)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            '&:hover': { bgcolor: '#efe2c4' },
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                              {reg.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                              <Typography variant="caption" sx={{ color: '#4a3227' }}>
                                {reg.phone || 'Sem telefone'} • {reg.age ? `${reg.age} anos` : 'Idade ñ inf.'}
                              </Typography>
                              {reg.dietaryRestrictions && (
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                                  <Typography variant="caption" sx={{ color: '#4a3227' }}>•</Typography>
                                  <WarningIcon sx={{ fontSize: 12, color: '#c15c71' }} />
                                  <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 600 }}>
                                    {reg.dietaryRestrictions}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Chip
                              label={reg.paymentStatus === 'paid' ? 'Pago' : reg.paymentStatus === 'partial' ? 'Parcial' : 'Pendente'}
                              size="small"
                              sx={{
                                bgcolor: reg.paymentStatus === 'paid' ? '#7fa176' : reg.paymentStatus === 'partial' ? '#d3a34c' : '#efe2c4',
                                color: reg.paymentStatus === 'paid' ? '#fff' : '#2a1420',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                              }}
                            />
                            <Chip
                              label={reg.confirmed ? 'Confirmado' : 'Inscrito'}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: '#4a3227', color: '#2a1420', fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              )}

              {/* TAB 1: FINANCEIRO DO EVENTO */}
              {tabIndex === 1 && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#4a3227' }}>{max > 0 ? `Esperado (${max} vagas)` : 'Esperado Total'}</Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                          R$ {expectedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#4f6b4f' }}>Recebido ({confirmedRegs} confirmados)</Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#4f6b4f', fontVariantNumeric: 'tabular-nums' }}>
                          R$ {receivedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#d3a34c' }}>Pendente a Receber</Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#d3a34c', fontVariantNumeric: 'tabular-nums' }}>
                          R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                </Box>
              )}

              {/* TAB 2: ORGANIZAÇÃO / CHECKLIST */}
              {tabIndex === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(!selectedEvent.checklist || selectedEvent.checklist.length === 0) ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4a3227', opacity: 0.8 }}>
                          Nenhum item no checklist cadastrado para este evento.
                        </Typography>
                      </Box>
                    ) : (
                      selectedEvent.checklist.map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            bgcolor: '#ffffff',
                            borderRadius: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Checkbox
                              checked={item.completed}
                              onChange={async () => {
                                await TerezinhaService.toggleChecklistItem(selectedEvent.id, item.id);
                                await loadEvents();
                                const updated = await TerezinhaService.getEventBySlug(selectedEvent.id);
                                if (updated) setSelectedEvent(updated);
                              }}
                              sx={{ color: '#4a3227', '&.Mui-checked': { color: '#7fa176' } }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: item.completed ? 400 : 700, textDecoration: item.completed ? 'line-through' : 'none', color: '#2a1420' }}>
                              {item.title}
                            </Typography>
                          </Box>
                          {item.assignedTo && (
                            <Chip label={item.assignedTo} size="small" sx={{ bgcolor: '#efe2c4', color: '#4a3227', fontWeight: 600 }} />
                          )}
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              )}

              {/* TAB 3: EQUIPES & SERVIDORES */}
              {tabIndex === 3 && (
                <Box>
                  {canCreate && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setOpenTeamModal(true)}
                        sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#9a3450' } }}
                      >
                        Adicionar Membro
                      </Button>
                    </Box>
                  )}
                  <Box>
                    {(!selectedEvent.teams || selectedEvent.teams.length === 0) ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4a3227', opacity: 0.8 }}>
                          Nenhuma equipe ou servidor atribuído a este evento.
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {selectedEvent.teams.map((t, i) => (
                          <Grid key={i} size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 800, textTransform: 'uppercase' }}>
                                  {t.role}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                                  {t.personName}
                                </Typography>
                              </Box>
                              <Chip
                                label={t.status === 'pending' ? 'Pendente' : 'Confirmado'}
                                size="small"
                                sx={{
                                  bgcolor: t.status === 'pending' ? '#efe2c4' : '#7fa176',
                                  color: t.status === 'pending' ? '#2a1420' : '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 4, bgcolor: '#f7efdd', borderRadius: '16px', textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#2a1420', fontWeight: 600 }}>
                Selecione ou crie um evento para ver os detalhes completos.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Modal Adicionar Membro à Equipe */}
      <Dialog open={openTeamModal} onClose={() => setOpenTeamModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
        <form onSubmit={handleAddTeamMember}>
          <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Adicionar Membro à Equipe</DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome do Membro"
              required
              fullWidth
              value={teamMemberName}
              onChange={(e) => setTeamMemberName(e.target.value)}
              placeholder="Ex: Maria Silva"
            />
            <TextField
              label="Função / Ministério"
              required
              fullWidth
              value={teamMemberRole}
              onChange={(e) => setTeamMemberRole(e.target.value)}
              placeholder="Ex: Música, Liturgia, Cozinha, Coordenação..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenTeamModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={savingTeam} sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>
              {savingTeam ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Confirmação Exclusão de Evento */}
      <Dialog open={!!deleteEventTarget} onClose={() => setDeleteEventTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Excluir Evento?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja excluir <strong>{deleteEventTarget?.title}</strong>? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteEventTarget(null)} sx={{ color: '#4a3227' }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={deletingEvent}
            onClick={handleDeleteEvent}
            sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}
          >
            {deletingEvent ? 'Excluindo...' : 'Sim, Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Criar Evento */}
      <Dialog open={openNewModal} onClose={() => setOpenNewModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
        <form onSubmit={handleCreateEvent}>
          <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>
            Novo Evento
          </DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nome do Evento" required fullWidth value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Luau de Outono 2026" />
            <TextField
              select
              label="Tipo de Evento"
              fullWidth
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as EventCategory)}
            >
              {EVENT_CATEGORY_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Data do Evento" type="date" InputLabelProps={{ shrink: true }} fullWidth value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <TextField label="Local" fullWidth value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Limite de Vagas" type="number" fullWidth value={newMax} onChange={(e) => setNewMax(e.target.value)} placeholder="Opcional" />
              <TextField label="Valor (R$)" type="number" fullWidth value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0 = Gratuito" />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenNewModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>
              {saving ? 'Salvando…' : 'Salvar Evento'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EventsPage;
