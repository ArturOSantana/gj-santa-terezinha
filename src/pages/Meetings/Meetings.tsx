import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { Meeting } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

export const MeetingsPage = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [openModal, setOpenModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState('');
  const [decisionsText, setDecisionsText] = useState('');
  const [tasksText, setTasksText] = useState('');

  const canCreate = user ? hasPermission(user.role, 'leader') : false;

  useEffect(() => {
    if (user) setAttendees(user.displayName || '');
    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    const list = await TerezinhaService.getMeetings();
    setMeetings(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const decs = decisionsText.split('\n').filter(Boolean).map((t, i) => ({ id: `d-${i}`, text: t }));
    const tsks = tasksText.split('\n').filter(Boolean).map((t, i) => ({ id: `gt-${i}`, taskTitle: t, assignedTo: 'Coordenação' }));

    await TerezinhaService.createMeeting({
      title,
      date: new Date(),
      location: 'Sala Paroquial Santa Terezinha',
      attendees: attendees.split(',').map((s) => s.trim()),
      agenda: [],
      decisions: decs,
      generatedTasks: tsks,
    });

    setTitle('');
    setDecisionsText('');
    setTasksText('');
    setOpenModal(false);
    await loadMeetings();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Reuniões & Atas da Liderança
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Registrar Reunião
          </Button>
        )}
      </Box>

      {/* Lista de Reuniões */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {meetings.map((m) => (
          <Box
            key={m.id}
            sx={{
              bgcolor: '#f7efdd',
              color: '#2a1420',
              p: 3.5,
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              border: '1px solid rgba(211, 163, 76, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pb: 1.5, borderBottom: '1px solid rgba(107, 83, 71, 0.2)' }}>
              <Box>
                <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
                  {m.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 14, color: '#c15c71' }} />
                    <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                      {new Date(m.date).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#4a3227' }}>•</Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 14, color: '#c15c71' }} />
                    <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                      {m.location || 'Sala Paroquial'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Participantes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
              <PeopleIcon sx={{ fontSize: 18, color: '#c15c71' }} />
              <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 700 }}>Presentes:</Typography>
              {m.attendees.map((att, i) => (
                <Chip key={i} label={att} size="small" sx={{ bgcolor: '#efe2c4', color: '#2a1420', fontSize: '0.72rem', fontWeight: 600 }} />
              ))}
            </Box>

            {/* Decisões */}
            <Box sx={{ mb: 2.5, bgcolor: '#ffffff', p: 2, borderRadius: 2, border: '1px solid rgba(107, 83, 71, 0.12)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2a1420', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Decisões Tomadas:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {m.decisions.map((d) => (
                  <Typography key={d.id} variant="body2" sx={{ color: '#2a1420' }}>
                    • <strong>Decidido:</strong> {d.text}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Tarefas Geradas */}
            {m.generatedTasks.length > 0 && (
              <Box sx={{ bgcolor: '#efe2c4', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9a3450', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Tarefas Geradas para a Coordenação:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {m.generatedTasks.map((t) => (
                    <Typography key={t.id} variant="body2" sx={{ color: '#2a1420' }}>
                      • <strong>{t.assignedTo}:</strong> {t.taskTitle}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Modal Registrar Reunião */}
      {canCreate && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Ata / Reunião da Liderança</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Pauta / Título da Reunião" required fullWidth value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Planejamento Retiro FIAT" />
              <TextField label="Presentes (separados por vírgula)" fullWidth value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Nome 1, Nome 2, ..." />
              <TextField label="Decisões Tomadas (1 por linha)" multiline rows={3} fullWidth value={decisionsText} onChange={(e) => setDecisionsText(e.target.value)} placeholder="Tema definido&#10;Valor R$ 120" />
              <TextField label="Tarefas Geradas (1 por linha)" multiline rows={3} fullWidth value={tasksText} onChange={(e) => setTasksText(e.target.value)} placeholder="Fechar cronograma&#10;Verificar alimentação" />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>Salvar Ata</Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default MeetingsPage;
