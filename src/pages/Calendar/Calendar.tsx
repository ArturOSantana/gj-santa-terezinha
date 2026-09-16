import React from 'react';
import type { View } from 'react-big-calendar';
import {
  Box,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  Grid,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Today as TodayIcon,
  FilterList as FilterIcon,
  EventAvailable as EventAvailableIcon,
  CalendarMonth as CalendarMonthIcon,
  AutoAwesomeMotion as AutoAwesomeMotionIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { printBeautifulCalendar, generateFullCalendarICS } from '../../utils/calendarExport';
import { ptBR } from 'date-fns/locale';
import CalendarView from '../../components/common/CalendarView';
import EventCard from '../../components/common/EventCard';
import EventDetailsModal from '../../components/common/EventDetailsModal';
import EventFormModal from '../../components/common/EventFormModal';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { useCalendar } from '../../hooks/useCalendar';
import { EventCategory, ActivityType, Gender } from '../../types';
import { EVENT_CATEGORIES, ACTIVITY_TYPES } from '../../utils/constants';

const Calendar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showFilters, setShowFilters] = React.useState(!isMobile);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const {
    events,
    selectedEvent,
    isDetailsModalOpen,
    isFormModalOpen,
    editingEvent,
    filters,
    view,
    currentDate,
    setView,
    setCurrentDate,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleFilterChange,
    handleSelectEvent,
    handleSelectSlot,
    handleEditEvent,
    handleCloseDetailsModal,
    handleCloseFormModal,
    handleOpenCreateModal,
    handleNavigateToday,
    handleToggleAllFilters,
    permissions,
  } = useCalendar();

  const eventCategories = Object.entries(EVENT_CATEGORIES).map(([key, value]) => ({
    type: key as EventCategory,
    label: value.label,
    color: value.color,
  }));

  const activityTypes = Object.entries(ACTIVITY_TYPES).map(([key, value]) => ({
    type: key as ActivityType,
    label: value.label,
  }));

  const [activityFilters, setActivityFilters] = React.useState<ActivityType[]>(
    Object.keys(ACTIVITY_TYPES) as ActivityType[]
  );

  const [genderFilters, setGenderFilters] = React.useState<Gender[]>([
    Gender.MALE,
    Gender.FEMALE,
    Gender.MIXED,
  ]);

  const handleFilterToggle = (type: EventCategory) => {
    const newFilters = filters.includes(type)
      ? filters.filter((f) => f !== type)
      : [...filters, type];
    handleFilterChange(newFilters);
  };

  const handleActivityFilterToggle = (type: ActivityType) => {
    const newFilters = activityFilters.includes(type)
      ? activityFilters.filter((f) => f !== type)
      : [...activityFilters, type];
    setActivityFilters(newFilters);
  };

  const handleToggleAllActivityFilters = () => {
    if (activityFilters.length === activityTypes.length) {
      setActivityFilters([]);
    } else {
      setActivityFilters(Object.keys(ACTIVITY_TYPES) as ActivityType[]);
    }
  };

  const handleGenderFilterToggle = (gender: Gender) => {
    const newFilters = genderFilters.includes(gender)
      ? genderFilters.filter((f) => f !== gender)
      : [...genderFilters, gender];
    setGenderFilters(newFilters);
  };

  const handleToggleAllGenderFilters = () => {
    if (genderFilters.length === 3) {
      setGenderFilters([]);
    } else {
      setGenderFilters([Gender.MALE, Gender.FEMALE, Gender.MIXED]);
    }
  };

  const filteredEvents = events.filter((event) => {
    const categoryMatch = filters.includes(event.category);
    if (!categoryMatch) return false;

    if (event.activityType) {
      if (!activityFilters.includes(event.activityType)) return false;
    }

    if (event.targetGender) {
      return genderFilters.includes(event.targetGender);
    }

    return genderFilters.includes(Gender.MIXED);
  });

  const upcomingHighlighted = [...filteredEvents]
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const handleCreateWithFeedback = async (eventData: any) => {
    try {
      await handleCreateEvent(eventData);
      setSnackbar({
        open: true,
        message: 'Evento criado com sucesso!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erro ao criar evento',
        severity: 'error',
      });
    }
  };

  const handleUpdateWithFeedback = async (id: string, eventData: any) => {
    try {
      await handleUpdateEvent(id, eventData);
      setSnackbar({
        open: true,
        message: 'Evento atualizado com sucesso!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erro ao atualizar evento',
        severity: 'error',
      });
    }
  };

  const handleDeleteWithFeedback = async (id: string) => {
    try {
      await handleDeleteEvent(id);
      setSnackbar({
        open: true,
        message: 'Evento excluído com sucesso!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erro ao excluir evento',
        severity: 'error',
      });
    }
  };

  const headerAction = (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
      <Button
        variant="outlined"
        startIcon={<TodayIcon />}
        onClick={handleNavigateToday}
        size={isMobile ? 'small' : 'medium'}
        sx={{ borderRadius: 2.5 }}
      >
        Hoje
      </Button>

      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={() => printBeautifulCalendar(filteredEvents)}
        size={isMobile ? 'small' : 'medium'}
        sx={{ borderRadius: 2.5 }}
      >
        Imprimir / PDF
      </Button>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={() => {
          generateFullCalendarICS(filteredEvents);
          setSnackbar({
            open: true,
            message: 'Arquivo .ics do calendário baixado com sucesso!',
            severity: 'success',
          });
        }}
        size={isMobile ? 'small' : 'medium'}
        sx={{ borderRadius: 2.5 }}
      >
        Baixar .ICS
      </Button>

      {isMobile && (
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
          size="small"
          sx={{ borderRadius: 2.5 }}
        >
          Filtros
        </Button>
      )}

      {permissions.canCreateEvent && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          size={isMobile ? 'small' : 'medium'}
          sx={{ borderRadius: 2.5, px: 2.25 }}
        >
          Novo Evento
        </Button>
      )}
    </Stack>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: 'grid', gap: { xs: 2.5, md: 3.5 } }}>
      <PageHeader
        title="Calendário"
        action={headerAction}
      />

      <Grid container columnSpacing={{ xs: 2, md: 3 }} rowSpacing={{ xs: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: '16px',
              bgcolor: '#f7efdd',
              color: '#2a1420',
              border: '1px solid rgba(211, 163, 76, 0.25)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
              height: '100%',
            }}
          >
            <Stack spacing={{ xs: 2, md: 2.5 }}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: '#6b5347',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                >
                  Panorama da agenda
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Fraunces", Georgia, serif',
                    color: '#2a1420',
                    fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' },
                  }}
                >
                  {filteredEvents.length} eventos visíveis
                </Typography>
              </Box>

              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2.5,
                  bgcolor: '#efe2c4',
                  border: '1px solid rgba(211, 163, 76, 0.3)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    mb: 0.5,
                    display: 'block',
                    fontWeight: 700,
                    color: '#6b5347',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Mês em foco
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#2a1420',
                    textTransform: 'capitalize',
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                  }}
                >
                  {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </Typography>
              </Box>

              <Stack spacing={{ xs: 1, md: 1.25 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#2a1420',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Legenda de categorias
                </Typography>
                {eventCategories.map((category) => (
                  <Box
                    key={category.type}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 0.25,
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '4px',
                        backgroundColor: category.color,
                        boxShadow: `0 0 0 2px rgba(211, 163, 76, 0.25)`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#2a1420',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      }}
                    >
                      {category.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderRadius: '16px',
              bgcolor: '#f7efdd',
              color: '#2a1420',
              border: '1px solid rgba(211, 163, 76, 0.25)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
                gap: { xs: 2.5, sm: 3 },
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Fraunces", Georgia, serif',
                    color: '#2a1420',
                    mb: { xs: 1.5, md: 2 },
                    fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.3rem' },
                  }}
                >
                  Eventos próximos
                </Typography>

                {upcomingHighlighted.length > 0 ? (
                  <Stack spacing={2}>
                    {upcomingHighlighted.map((event) => (
                      <Box key={event.id}>
                        <EventCard event={event} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="Nenhum evento próximo"
                    description="Crie novos compromissos ou ajuste os filtros para visualizar outros encontros."
                  />
                )}
              </Box>

              <Box
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2.5,
                  bgcolor: '#efe2c4',
                  border: '1px solid rgba(211, 163, 76, 0.3)',
                }}
              >
                <Stack spacing={{ xs: 2, md: 2.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventAvailableIcon sx={{ color: '#c15c71', fontSize: { xs: 22, sm: 24 } }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontFamily: '"Fraunces", Georgia, serif',
                        color: '#2a1420',
                        fontSize: { xs: '1rem', sm: '1.15rem' },
                      }}
                    >
                      Filtros
                    </Typography>
                  </Box>

                  {showFilters ? (
                    <Stack spacing={2.5}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                            Categorias
                          </Typography>
                          <Button size="small" onClick={handleToggleAllFilters} sx={{ textTransform: 'none', color: '#c15c71', fontWeight: 700 }}>
                            {filters.length === eventCategories.length ? 'Limpar' : 'Todos'}
                          </Button>
                        </Box>
                        <FormGroup>
                          {eventCategories.map((category) => (
                            <FormControlLabel
                              key={category.type}
                              control={
                                <Checkbox
                                  checked={filters.includes(category.type)}
                                  onChange={() => handleFilterToggle(category.type)}
                                  size="small"
                                  sx={{
                                    color: category.color,
                                    '&.Mui-checked': {
                                      color: category.color,
                                    },
                                  }}
                                />
                              }
                              label={<Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 500 }}>{category.label}</Typography>}
                            />
                          ))}
                        </FormGroup>
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                            Tipo de atividade
                          </Typography>
                          <Button size="small" onClick={handleToggleAllActivityFilters} sx={{ textTransform: 'none', color: '#c15c71', fontWeight: 700 }}>
                            {activityFilters.length === activityTypes.length ? 'Limpar' : 'Todos'}
                          </Button>
                        </Box>
                        <FormGroup>
                          {activityTypes.map((activity) => (
                            <FormControlLabel
                              key={activity.type}
                              control={
                                <Checkbox
                                  checked={activityFilters.includes(activity.type)}
                                  onChange={() => handleActivityFilterToggle(activity.type)}
                                  size="small"
                                  sx={{
                                    color: '#7fa176',
                                    '&.Mui-checked': {
                                      color: '#4f6b4f',
                                    },
                                  }}
                                />
                              }
                              label={<Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 500 }}>{activity.label}</Typography>}
                            />
                          ))}
                        </FormGroup>
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                            Público
                          </Typography>
                          <Button size="small" onClick={handleToggleAllGenderFilters} sx={{ textTransform: 'none', color: '#c15c71', fontWeight: 700 }}>
                            {genderFilters.length === 3 ? 'Limpar' : 'Todos'}
                          </Button>
                        </Box>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={genderFilters.includes(Gender.MALE)}
                                onChange={() => handleGenderFilterToggle(Gender.MALE)}
                                size="small"
                                sx={{
                                  color: '#7fa176',
                                  '&.Mui-checked': {
                                    color: '#4f6b4f',
                                  },
                                }}
                              />
                            }
                            label={<Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 500 }}>Cavalheiros</Typography>}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={genderFilters.includes(Gender.FEMALE)}
                                onChange={() => handleGenderFilterToggle(Gender.FEMALE)}
                                size="small"
                                sx={{
                                  color: '#7fa176',
                                  '&.Mui-checked': {
                                    color: '#4f6b4f',
                                  },
                                }}
                              />
                            }
                            label={<Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 500 }}>Santa Joana</Typography>}
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={genderFilters.includes(Gender.MIXED)}
                                onChange={() => handleGenderFilterToggle(Gender.MIXED)}
                                size="small"
                                sx={{
                                  color: '#7fa176',
                                  '&.Mui-checked': {
                                    color: '#4f6b4f',
                                  },
                                }}
                              />
                            }
                            label={<Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 500 }}>Misto</Typography>}
                          />
                        </FormGroup>
                      </Box>
                    </Stack>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={() => setShowFilters(true)}
                      sx={{ alignSelf: 'flex-start', borderRadius: 2, borderColor: '#d3a34c', color: '#2a1420' }}
                    >
                      Exibir filtros
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: '16px',
          bgcolor: '#f7efdd',
          color: '#2a1420',
          border: '1px solid rgba(211, 163, 76, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
          minHeight: { xs: 520, md: 640 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarMonthIcon sx={{ color: '#c15c71' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Fraunces", Georgia, serif', color: '#2a1420' }}>
            Visualização principal
          </Typography>
          <Chip
            icon={<AutoAwesomeMotionIcon />}
            label={view === 'month' ? 'Mês' : view === 'week' ? 'Semana' : view === 'agenda' ? 'Agenda' : 'Dia'}
            size="small"
            sx={{ ml: 'auto', fontWeight: 700, bgcolor: '#efe2c4', color: '#2a1420' }}
          />
        </Box>

        {filteredEvents.length > 0 ? (
          <Box
            sx={{
              minHeight: { xs: 460, md: 560 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CalendarView
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              view={view}
              onViewChange={setView}
              date={currentDate}
              onNavigate={setCurrentDate}
            />
          </Box>
        ) : (
          <EmptyState
            title="Nenhum evento para exibir"
            description="Os filtros atuais não retornaram eventos. Ajuste a seleção ou crie um novo compromisso."
            action={
              permissions.canCreateEvent ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateModal}
                  sx={{ borderRadius: 2.5 }}
                >
                  Criar Evento
                </Button>
              ) : undefined
            }
          />
        )}
      </Paper>

      <EventDetailsModal
        event={selectedEvent}
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onEdit={handleEditEvent}
        onDelete={handleDeleteWithFeedback}
        canEdit={permissions.canEditEvent}
        canDelete={permissions.canDeleteEvent}
      />

      <EventFormModal
        event={editingEvent}
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleCreateWithFeedback}
        onUpdate={handleUpdateWithFeedback}
        initialDate={currentDate}
        readOnly={!permissions.canCreateEvent && !permissions.canEditEvent}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calendar;

