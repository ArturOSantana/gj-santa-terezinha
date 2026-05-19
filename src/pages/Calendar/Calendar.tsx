import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Stack,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Today as TodayIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import CalendarView from '../../components/common/CalendarView';
import EventDetailsModal from '../../components/common/EventDetailsModal';
import EventFormModal from '../../components/common/EventFormModal';
import { useCalendar } from '../../hooks/useCalendar';
import { EventCategory, ActivityType } from '../../types';
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

  // Informações das categorias de eventos
  const eventCategories = Object.entries(EVENT_CATEGORIES).map(([key, value]) => ({
    type: key as EventCategory,
    label: value.label,
    color: value.color,
  }));

  // Informações dos tipos de atividade
  const activityTypes = Object.entries(ACTIVITY_TYPES).map(([key, value]) => ({
    type: key as ActivityType,
    label: value.label,
  }));

  // Estado para filtros de tipo de atividade
  const [activityFilters, setActivityFilters] = React.useState<ActivityType[]>(
    Object.keys(ACTIVITY_TYPES) as ActivityType[]
  );

  // Manipula mudança de filtros de categoria
  const handleFilterToggle = (type: EventCategory) => {
    const newFilters = filters.includes(type)
      ? filters.filter((f) => f !== type)
      : [...filters, type];
    handleFilterChange(newFilters);
  };

  // Manipula mudança de filtros de tipo de atividade
  const handleActivityFilterToggle = (type: ActivityType) => {
    const newFilters = activityFilters.includes(type)
      ? activityFilters.filter((f) => f !== type)
      : [...activityFilters, type];
    setActivityFilters(newFilters);
  };

  // Toggle todos os filtros de atividade
  const handleToggleAllActivityFilters = () => {
    if (activityFilters.length === activityTypes.length) {
      setActivityFilters([]);
    } else {
      setActivityFilters(Object.keys(ACTIVITY_TYPES) as ActivityType[]);
    }
  };

  // Filtra eventos por categoria e tipo de atividade
  const filteredEvents = events.filter((event) => {
    const categoryMatch = filters.includes(event.category);
    if (!categoryMatch) return false;
    
    // Se for sábado e tiver tipo de atividade, aplica filtro
    if (event.category === EventCategory.SATURDAY && event.activityType) {
      return activityFilters.includes(event.activityType);
    }
    
    return true;
  });

  // Manipula criação de evento com feedback
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

  // Manipula atualização de evento com feedback
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

  // Manipula exclusão de evento com feedback
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Calendário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os eventos e encontros do Grupo de Jovens
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<TodayIcon />}
            onClick={handleNavigateToday}
            size={isMobile ? 'small' : 'medium'}
          >
            Hoje
          </Button>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
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
            >
              Novo Evento
            </Button>
          )}
        </Stack>
      </Box>

      {/* Layout Principal */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Sidebar com Filtros e Legenda */}
        {showFilters && (
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              flexShrink: 0,
            }}
          >
            {/* Card de Filtros */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Filtros
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleToggleAllFilters}
                    sx={{ textTransform: 'none' }}
                  >
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
                          sx={{
                            color: category.color,
                            '&.Mui-checked': {
                              color: category.color,
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {category.label}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </CardContent>
            </Card>

            {/* Card de Filtros de Tipo de Atividade */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tipo de Atividade
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleToggleAllActivityFilters}
                    sx={{ textTransform: 'none' }}
                  >
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
                          sx={{
                            color: '#2c5f2d',
                            '&.Mui-checked': {
                              color: '#2c5f2d',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {activity.label}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </CardContent>
            </Card>

            {/* Card de Legenda */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Legenda
                </Typography>
                <Stack spacing={1.5}>
                  {eventCategories.map((category) => (
                    <Box
                      key={category.type}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 1,
                          backgroundColor: category.color,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, lineHeight: 1.2 }}
                        >
                          {category.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Calendário */}
        <Paper
          sx={{
            flex: 1,
            p: { xs: 1, md: 2 },
            minHeight: { xs: 500, md: 600 },
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
        </Paper>
      </Box>

      {/* Modal de Detalhes do Evento */}
      <EventDetailsModal
        event={selectedEvent}
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onEdit={handleEditEvent}
        onDelete={handleDeleteWithFeedback}
        canEdit={permissions.canEditEvent}
        canDelete={permissions.canDeleteEvent}
      />

      {/* Modal de Formulário de Evento */}
      <EventFormModal
        event={editingEvent}
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleCreateWithFeedback}
        onUpdate={handleUpdateWithFeedback}
        initialDate={currentDate}
        readOnly={!permissions.canCreateEvent && !permissions.canEditEvent}
      />

      {/* Snackbar de Feedback */}
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

