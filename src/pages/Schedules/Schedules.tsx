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
  Share as ShareIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { ScheduleAssignment, ScheduleStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/permissions';

export const SchedulesPage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleAssignment[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form nova escala
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [role, setRole] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');

  const canManage = user ? hasPermission(user.role, 'leader') : false;

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    const list = await TerezinhaService.getSchedules();
    setSchedules(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !role || !eventTitle) return;
    setSaving(true);
    const token = Math.random().toString(36).slice(2, 10);
    await TerezinhaService.createSchedule({
      eventId: '',
      eventTitle,
      eventDate: eventDate ? new Date(eventDate + 'T00:00:00') : new Date(),
      role,
      personName,
      personPhone,
      status: ScheduleStatus.PENDING,
      publicToken: token,
    });
    setSaving(false);
    setOpenModal(false);
    setPersonName('');
    setPersonPhone('');
    setRole('');
    setEventTitle('');
    setEventDate('');
    await loadSchedules();
  };

  const handleShareWhatsApp = (sch: ScheduleAssignment) => {
    const confirmUrl = sch.publicToken
      ? `${window.location.origin}/p/escala/${sch.publicToken}`
      : `${window.location.origin}/p/agenda`;
    const text = `*Escala — Grupo de Jovens Santa Terezinha*\n\nOlá ${sch.personName}!\nVocê foi escalado(a) para servir como *${sch.role}* no encontro:\n*${sch.eventTitle}*\n\nConfirme ou justifique sua presença pelo link:\n${confirmUrl}`;
    window.open(`https://api.whatsapp.com/send?phone=${sch.personPhone ? sch.personPhone.replace(/\D/g, '') : ''}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleToggleStatus = async (sch: ScheduleAssignment, newStatus: ScheduleStatus) => {
    await TerezinhaService.updateScheduleStatus(sch.id, newStatus);
    await loadSchedules();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Equipes & Escalas
          </Typography>
        </Box>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
          >
            Nova Escala
          </Button>
        )}
      </Box>

      {/* Lista de Escalas */}
      <Box
        sx={{
          bgcolor: '#f7efdd',
          color: '#2a1420',
          p: 3.5,
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          border: '1px solid rgba(211, 163, 76, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid rgba(107, 83, 71, 0.2)' }}>
          <Typography variant="h5" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}>
            Escalas Cadastradas
          </Typography>
          <Chip label={`${schedules.length} Escalado${schedules.length !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: '#efe2c4', color: '#2a1420', fontWeight: 700 }} />
        </Box>

        {/* Lista de Escalados */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {schedules.map((sch) => {
            const isConfirmed = sch.status === ScheduleStatus.CONFIRMED;
            return (
              <Box
                key={sch.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(107, 83, 71, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {sch.role}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2a1420', lineHeight: 1.2 }}>
                    {sch.personName}
                  </Typography>
                  {sch.personPhone && (
                    <Typography variant="caption" sx={{ color: '#4a3227' }}>
                      {sch.personPhone}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    icon={isConfirmed ? <CheckIcon sx={{ fontSize: 14 }} /> : <PendingIcon sx={{ fontSize: 14 }} />}
                    label={isConfirmed ? 'Confirmado' : 'Pendente'}
                    size="small"
                    sx={{
                      bgcolor: isConfirmed ? '#7fa176' : '#efe2c4',
                      color: isConfirmed ? '#fff' : '#4a3227',
                      fontWeight: 700,
                    }}
                  />

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShareIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleShareWhatsApp(sch)}
                    sx={{ borderColor: '#7fa176', color: '#4f6b4f', fontWeight: 700, textTransform: 'none', py: 0.3 }}
                  >
                    Enviar no WhatsApp
                  </Button>

                  {canManage && (
                    <Button
                      size="small"
                      onClick={() => handleToggleStatus(sch, isConfirmed ? ScheduleStatus.PENDING : ScheduleStatus.CONFIRMED)}
                      sx={{ color: '#4a3227', fontSize: '0.75rem' }}
                    >
                      {isConfirmed ? 'Desmarcar' : 'Confirmar'}
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      {/* Modal Nova Escala */}
      {canManage && (
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>Nova Escala</DialogTitle>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nome do Evento" required fullWidth value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Ex: Encontro de Jovens — Maio" />
              <TextField label="Data do Evento" type="date" InputLabelProps={{ shrink: true }} fullWidth value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <TextField label="Nome da Pessoa" required fullWidth value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Nome completo" />
              <TextField label="WhatsApp" fullWidth value={personPhone} onChange={(e) => setPersonPhone(e.target.value)} placeholder="(11) 99999-9999" />
              <TextField label="Função / Ministério" required fullWidth value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Música, Liturgia, Lanche, Recepção..." />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: '#c15c71', color: '#fff', fontWeight: 700 }}>
                {saving ? 'Salvando...' : 'Salvar Escala'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default SchedulesPage;
