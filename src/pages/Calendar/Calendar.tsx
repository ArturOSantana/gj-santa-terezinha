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
import { SaturdayType } from '../../types';

/**
 * Página de Calendário
 * Gerencia eventos e encontros do Grupo de Jovens
 */
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
  } = useCalendar();

  // Informações dos tipos de sábado
  const saturdayTypes = [
    {
      type: SaturdayType.FIRST,
      label: '1º Sábado',
      description: 'Oração e Espiritualidade',
      color: '#9c27b0',
    },
    {
      type: SaturdayType.SECOND,
      label: '2º Sábado',
      description: 'Grande Evento/Convivência',
      color: '#ff9800',
    },
    {
      type: SaturdayType.THIRD,
      label: '3º Sábado',
      description: 'Formação I - Doutrinário',
      color: '#2196f3',
    },
    {
      type: SaturdayType.FOURTH,
      label: '4º Sábado',
      description: 'Formação II - Aprofundamento',
      color: '#4caf50',
    },
  ];

  // Manipula mudança de filtros
  const handleFilterToggle = (type: SaturdayType) => {
    const newFilters = filters.includes(type)
      ? filters.filter((f) => f !== type)
      : [...filters, type];
    handleFilterChange(newFilters);
  };

  // Manipula criação de evento com feedback
  const handleCreateWithFeedback = (eventData: any) => {
    handleCreateEvent(eventData);
    setSnackbar({
      open: true,
      message: 'Evento criado com sucesso!',
      severity: 'success',
    });
  };

  // Manipula atualização de evento com feedback
  const handleUpdateWithFeedback = (id: string, eventData: any) => {
    handleUpdateEvent(id, eventData);
    setSnackbar({
      open: true,
      message: 'Evento atualizado com sucesso!',
      severity: 'success',
    });
  };

  // Manipula exclusão de evento com feedback
  const handleDeleteWithFeedback = (id: string) => {
    handleDeleteEvent(id);
    setSnackbar({
      open: true,
      message: 'Evento excluído com sucesso!',
      severity: 'success',
    });
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            size={isMobile ? 'small' : 'medium'}
          >
            Novo Evento
          </Button>
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
                    {filters.length === 4 ? 'Limpar' : 'Todos'}
                  </Button>
                </Box>

                <FormGroup>
                  {saturdayTypes.map((type) => (
                    <FormControlLabel
                      key={type.type}
                      control={
                        <Checkbox
                          checked={filters.includes(type.type)}
                          onChange={() => handleFilterToggle(type.type)}
                          sx={{
                            color: type.color,
                            '&.Mui-checked': {
                              color: type.color,
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {type.label}
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
                  {saturdayTypes.map((type) => (
                    <Box
                      key={type.type}
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
                          backgroundColor: type.color,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, lineHeight: 1.2 }}
                        >
                          {type.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.2 }}
                        >
                          {type.description}
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
            events={events}
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
      />

      {/* Modal de Formulário de Evento */}
      <EventFormModal
        event={editingEvent}
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleCreateWithFeedback}
        onUpdate={handleUpdateWithFeedback}
        initialDate={currentDate}
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

// Made with Bob
