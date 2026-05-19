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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Event, SaturdayType } from '../../types';
import { format } from 'date-fns';

interface EventFormModalProps {
  event?: Event | null;
  open: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, eventData: Partial<Event>) => void;
  initialDate?: Date;
}

/**
 * Identifica automaticamente o tipo de sábado baseado na data
 */
const getSaturdayTypeFromDate = (date: Date): SaturdayType => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstSaturday = new Date(firstDayOfMonth);
  
  // Encontra o primeiro sábado do mês
  while (firstSaturday.getDay() !== 6) {
    firstSaturday.setDate(firstSaturday.getDate() + 1);
  }
  
  // Calcula qual sábado do mês é a data fornecida
  const daysDiff = Math.floor((date.getTime() - firstSaturday.getTime()) / (1000 * 60 * 60 * 24));
  const saturdayNumber = Math.floor(daysDiff / 7) + 1;
  
  // Retorna o tipo de sábado (1-4)
  if (saturdayNumber >= 1 && saturdayNumber <= 4) {
    return saturdayNumber as SaturdayType;
  }
  
  return SaturdayType.FIRST;
};

/**
 * Modal de formulário para criar/editar evento
 */
const EventFormModal: React.FC<EventFormModalProps> = ({
  event,
  open,
  onClose,
  onSave,
  onUpdate,
  initialDate,
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
    saturdayType: SaturdayType.FIRST,
    isSpecialEvent: false,
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
        saturdayType: event.saturdayType,
        isSpecialEvent: event.isSpecialEvent,
        notes: event.notes || '',
      });
    } else if (initialDate) {
      const suggestedType = getSaturdayTypeFromDate(initialDate);
      setFormData((prev) => ({
        ...prev,
        date: format(initialDate, 'yyyy-MM-dd'),
        saturdayType: suggestedType,
      }));
    }
  }, [event, initialDate, open]);

  // Atualiza o tipo de sábado quando a data muda
  const handleDateChange = (newDate: string) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate,
      saturdayType: getSaturdayTypeFromDate(new Date(newDate)),
    }));
  };

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
    if (!validateForm()) {
      return;
    }

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim(),
      saturdayType: formData.saturdayType,
      isSpecialEvent: formData.isSpecialEvent,
      attendees: event?.attendees || [],
      attendance: event?.attendance || {},
      notes: formData.notes.trim(),
    };

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
      saturdayType: SaturdayType.FIRST,
      isSpecialEvent: false,
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
          borderRadius: fullScreen ? 0 : 2,
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
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {isEditing ? 'Editar Evento' : 'Novo Evento'}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="fechar"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Título */}
          <TextField
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            multiline
            rows={3}
            fullWidth
          />

          {/* Data */}
          <TextField
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
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
            error={!!errors.location}
            helperText={errors.location}
            required
            fullWidth
          />

          {/* Tipo de Sábado */}
          <TextField
            label="Tipo de Sábado"
            select
            value={formData.saturdayType}
            onChange={(e) => setFormData({ ...formData, saturdayType: Number(e.target.value) as SaturdayType })}
            required
            fullWidth
          >
            <MenuItem value={SaturdayType.FIRST}>1º Sábado - Oração e Espiritualidade</MenuItem>
            <MenuItem value={SaturdayType.SECOND}>2º Sábado - Grande Evento/Convivência</MenuItem>
            <MenuItem value={SaturdayType.THIRD}>3º Sábado - Formação I - Doutrinário</MenuItem>
            <MenuItem value={SaturdayType.FOURTH}>4º Sábado - Formação II - Aprofundamento</MenuItem>
          </TextField>

          {/* Evento Especial */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.isSpecialEvent}
                onChange={(e) => setFormData({ ...formData, isSpecialEvent: e.target.checked })}
                color="primary"
              />
            }
            label="Marcar como evento especial"
          />

          {/* Observações */}
          <TextField
            label="Observações"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={2}
            fullWidth
            placeholder="Informações adicionais sobre o evento"
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventFormModal;

// Made with Bob