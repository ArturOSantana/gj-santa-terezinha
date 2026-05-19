import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';
import { Member, Event } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Props do componente AttendanceDialog
 */
interface AttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (eventId: string, memberIds: string[]) => void;
  members: Member[];
  events: Event[];
}

/**
 * Gera as iniciais do nome
 */
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Componente AttendanceDialog
 * Dialog para registrar presença em um evento
 */
const AttendanceDialog: React.FC<AttendanceDialogProps> = ({
  open,
  onClose,
  onSave,
  members,
  events,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  // Reseta o estado quando o dialog abre
  useEffect(() => {
    if (open) {
      setSelectedEventId('');
      setSelectedMembers(new Set());
      setSearchTerm('');
      setGenderFilter('all');
    }
  }, [open]);

  // Carrega presenças existentes quando um evento é selecionado
  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event && event.attendees) {
        setSelectedMembers(new Set(event.attendees));
      } else {
        setSelectedMembers(new Set());
      }
    }
  }, [selectedEventId, events]);

  // Filtra membros por busca e gênero
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || member.gender === genderFilter;
    return matchesSearch && matchesGender && member.status === 'active';
  });

  // Separa membros por gênero
  const maleMembers = filteredMembers.filter(m => m.gender === 'male');
  const femaleMembers = filteredMembers.filter(m => m.gender === 'female');

  /**
   * Alterna a seleção de um membro
   */
  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  /**
   * Marca/desmarca todos os membros
   */
  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  /**
   * Marca/desmarca todos de um gênero específico
   */
  const toggleGender = (gender: 'male' | 'female', checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    const genderMembers = filteredMembers.filter(m => m.gender === gender);
    
    if (checked) {
      genderMembers.forEach(m => newSelected.add(m.id));
    } else {
      genderMembers.forEach(m => newSelected.delete(m.id));
    }
    
    setSelectedMembers(newSelected);
  };

  /**
   * Salva as presenças
   */
  const handleSave = () => {
    if (!selectedEventId) {
      return;
    }
    onSave(selectedEventId, Array.from(selectedMembers));
    onClose();
  };

  // Verifica se todos estão selecionados
  const allSelected = filteredMembers.length > 0 && 
                     filteredMembers.every(m => selectedMembers.has(m.id));
  const allMaleSelected = maleMembers.length > 0 && 
                         maleMembers.every(m => selectedMembers.has(m.id));
  const allFemaleSelected = femaleMembers.length > 0 && 
                           femaleMembers.every(m => selectedMembers.has(m.id));

  // Eventos futuros e recentes (últimos 7 dias)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const availableEvents = events
    .filter(e => e.date >= sevenDaysAgo)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="attendance-dialog-title"
    >
      <DialogTitle
        id="attendance-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Typography variant="h6" component="span">
          Registrar Presença
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="fechar"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Seleção de Evento */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Selecione o Evento</InputLabel>
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            label="Selecione o Evento"
          >
            {availableEvents.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.title} - {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedEventId && (
          <>
            {/* Filtros */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Buscar membro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Todos"
                  onClick={() => setGenderFilter('all')}
                  color={genderFilter === 'all' ? 'primary' : 'default'}
                  variant={genderFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip
                  label="Rapazes"
                  onClick={() => setGenderFilter('male')}
                  color={genderFilter === 'male' ? 'primary' : 'default'}
                  variant={genderFilter === 'male' ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: genderFilter === 'male' ? '#2196f3' : undefined,
                    '&:hover': {
                      bgcolor: genderFilter === 'male' ? '#1976d2' : undefined,
                    },
                  }}
                />
                <Chip
                  label="Moças"
                  onClick={() => setGenderFilter('female')}
                  color={genderFilter === 'female' ? 'primary' : 'default'}
                  variant={genderFilter === 'female' ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: genderFilter === 'female' ? '#e91e63' : undefined,
                    color: genderFilter === 'female' ? 'white' : undefined,
                    '&:hover': {
                      bgcolor: genderFilter === 'female' ? '#c2185b' : undefined,
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Controles de Seleção */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => toggleAll(!allSelected)}
                startIcon={allSelected ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
              >
                {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
              </Button>
              {genderFilter === 'all' && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => toggleGender('male', !allMaleSelected)}
                    sx={{ color: '#2196f3', borderColor: '#2196f3' }}
                  >
                    {allMaleSelected ? 'Desmarcar' : 'Marcar'} Rapazes
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => toggleGender('female', !allFemaleSelected)}
                    sx={{ color: '#e91e63', borderColor: '#e91e63' }}
                  >
                    {allFemaleSelected ? 'Desmarcar' : 'Marcar'} Moças
                  </Button>
                </>
              )}
            </Box>

            {/* Contador */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedMembers.size} de {filteredMembers.length} membros selecionados
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Lista de Membros */}
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredMembers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  Nenhum membro encontrado
                </Typography>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedMembers.has(member.id);
                  const genderColor = member.gender === 'male' ? '#2196f3' : '#e91e63';
                  const initials = getInitials(member.name);

                  return (
                    <ListItem key={member.id} disablePadding>
                      <ListItemButton
                        onClick={() => toggleMember(member.id)}
                        dense
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={isSelected}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemIcon>
                          <Avatar
                            src={member.photoUrl}
                            alt={member.name}
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: genderColor,
                              fontSize: '0.875rem',
                            }}
                          >
                            {!member.photoUrl && initials}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={member.name}
                          secondary={member.email}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              )}
            </List>
          </>
        )}

        {!selectedEventId && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Selecione um evento para registrar as presenças
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!selectedEventId}
        >
          Salvar Presenças
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceDialog;

// Made with Bob