import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  People as PeopleIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import { Event, EventCategory, ActivityType, Gender } from '../../types';
import { EVENT_CATEGORY_OPTIONS, ACTIVITY_TYPE_OPTIONS } from '../../utils/constants';
import { format } from 'date-fns';

interface EventFormModalProps {
  event?: Event | null;
  open: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, eventData: Partial<Event>) => void;
  initialDate?: Date;
  readOnly?: boolean;
}


const EventFormModal: React.FC<EventFormModalProps> = ({
  event,
  open,
  onClose,
  onSave,
  onUpdate,
  initialDate,
  readOnly = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!event;

  // Estado do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '18:00',
    endTime: '21:15',
    location: 'Paróquia Santa Terezinha',
    category: EventCategory.MEETING,
    activityType: undefined as ActivityType | undefined,
    targetGender: Gender.MIXED as Gender | undefined,
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Inicializa o formulário com dados do evento ou data inicial
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        date: format(event.date, 'yyyy-MM-dd'),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        activityType: event.activityType,
        targetGender: event.targetGender || Gender.MIXED,
        notes: event.notes || '',
      });
    } else if (initialDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(initialDate, 'yyyy-MM-dd'),
      }));
    }
  }, [event, initialDate, open]);

  // Valida o formulário
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!isEditing && selectedDate < today) {
        newErrors.date = 'Não é possível criar eventos no passado';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Horário de início é obrigatório';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Horário de término é obrigatório';
    }

    if (formData.startTime && formData.endTime) {
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (startMinutes >= endMinutes) {
        newErrors.endTime = 'Horário de término deve ser após o início';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Local é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submete o formulário
  const handleSubmit = () => {
    if (readOnly) {
      handleClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Criar data no timezone local (Brasília UTC-3)
    // Formato: "2026-06-03" -> Date com hora local meio-dia para evitar problemas de timezone
    const [year, month, day] = formData.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    
    const eventData: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: localDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim(),
      category: formData.category,
      notes: formData.notes.trim(),
    };

    // Adicionar campos opcionais apenas se tiverem valor
    if (formData.activityType !== undefined) {
      eventData.activityType = formData.activityType;
    }
    if (formData.targetGender !== undefined) {
      eventData.targetGender = formData.targetGender;
    }

    if (isEditing && event && onUpdate) {
      onUpdate(event.id, eventData);
    } else {
      onSave(eventData);
    }

    handleClose();
  };

  // Fecha o modal e reseta o formulário
  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '18:00',
      endTime: '21:15',
      location: 'Paróquia Santa Terezinha',
      category: EventCategory.MEETING,
      activityType: undefined,
      targetGender: Gender.MIXED,
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: fullScreen ? 0 : 3,
          bgcolor: '#f7efdd',
          color: '#2a1420',
          border: '1px solid rgba(211, 163, 76, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontFamily: '"Fraunces", Georgia, serif', color: '#2a1420' }}>
          {isEditing ? 'Editar Evento' : 'Novo Evento'}
        </Typography>
        <IconButton
          edge="end"
          onClick={handleClose}
          aria-label="fechar"
          size="small"
          sx={{ color: '#6b5347' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(211, 163, 76, 0.2)' }} />

      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Título */}
          <TextField
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={readOnly}
            error={!!errors.title}
            helperText={errors.title}
            required
            fullWidth
            autoFocus
          />

          {/* Descrição */}
          <TextField
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={readOnly}
            multiline
            rows={3}
            fullWidth
          />

          {/* Data */}
          <TextField
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            disabled={readOnly}
            error={!!errors.date}
            helperText={errors.date}
            required
            fullWidth
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />

          {/* Horários */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Horário de Início"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              disabled={readOnly}
              error={!!errors.startTime}
              helperText={errors.startTime}
              required
              fullWidth
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
            <TextField
              label="Horário de Término"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              disabled={readOnly}
              error={!!errors.endTime}
              helperText={errors.endTime}
              required
              fullWidth
              slotProps={{
                inputLabel: { shrink: true }
              }}
            />
          </Box>

          {/* Local */}
          <TextField
            label="Local"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={readOnly}
            error={!!errors.location}
            helperText={errors.location}
            required
            fullWidth
          />

          {/* Categoria do Evento */}
          <TextField
            label="Categoria do Evento"
            select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
            disabled={readOnly}
            required
            fullWidth
          >
            {EVENT_CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Tipo de Atividade */}
          {(formData.category === EventCategory.MEETING || formData.category === EventCategory.GJ_MEETING || formData.category === EventCategory.FORMATION) && (
            <TextField
              label="Tipo de Atividade"
              select
              value={formData.activityType || ''}
              onChange={(e) => setFormData({ ...formData, activityType: (e.target.value || undefined) as ActivityType | undefined })}
              disabled={readOnly}
              fullWidth
              helperText="Selecione o tipo de atividade (opcional)"
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Público-Alvo (Gênero) */}
          <TextField
            label="Público-Alvo"
            select
            value={formData.targetGender || Gender.MIXED}
            onChange={(e) => setFormData({ ...formData, targetGender: e.target.value as Gender })}
            disabled={readOnly}
            fullWidth
            helperText="Selecione o público-alvo deste evento"
          >
            <MenuItem value={Gender.MIXED}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Misto (Todos)
              </Box>
            </MenuItem>
            <MenuItem value={Gender.MALE}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MaleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Rapazes
              </Box>
            </MenuItem>
            <MenuItem value={Gender.FEMALE}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FemaleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                Moças
              </Box>
            </MenuItem>
          </TextField>

          {/* Observações */}
          <TextField
            label="Observações"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            disabled={readOnly}
            multiline
            rows={2}
            fullWidth
            placeholder="Informações adicionais sobre o evento"
          />
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(211, 163, 76, 0.2)' }} />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: '#2a1420' }}>
          Cancelar
        </Button>
        {!readOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventFormModal;

