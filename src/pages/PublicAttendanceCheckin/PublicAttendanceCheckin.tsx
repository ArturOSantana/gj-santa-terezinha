import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  QrCodeScanner as QrIcon,
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TerezinhaService } from '../../services/firestore.service';
import { Event } from '../../types';

export const PublicAttendanceCheckin = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState<string>('');
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const loadNextEvent = async () => {
      setLoadingEvent(true);
      const events = await TerezinhaService.getEvents();
      const now = new Date();
      // Pega o próximo evento público (mais próximo no futuro) ou, se não houver, o mais recente
      const upcoming = events
        .filter((e) => e.isPublic)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const next = upcoming.find((e) => new Date(e.date) >= now) || upcoming[upcoming.length - 1] || null;
      setActiveEvent(next);
      setLoadingEvent(false);
    };
    loadNextEvent();
  }, []);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    const safeName = name.trim().slice(0, 100);
    const safePhone = phone.replace(/[^\d\s()\-+]/g, '').trim().slice(0, 25);

    if (safeName.length < 3) return;

    const record = await TerezinhaService.registerAttendance({
      eventId: activeEvent.id,
      eventTitle: activeEvent.title,
      eventDate: new Date(activeEvent.date),
      personName: safeName,
      phone: safePhone,
      method: 'qr_code',
    });

    setCheckedInTime(new Date(record.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setConfirmed(true);
  };

  const eventDateStr = activeEvent
    ? new Date(activeEvent.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#241019',
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/')}
          sx={{ color: '#e2cad2', mb: 2, fontSize: '0.8rem' }}
        >
          Início
        </Button>

        <Box
          sx={{
            bgcolor: '#f7efdd',
            color: '#2a1420',
            p: 3.5,
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(211, 163, 76, 0.3)',
            textAlign: 'center',
          }}
        >
          {loadingEvent ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress sx={{ color: '#c15c71' }} />
            </Box>
          ) : confirmed ? (
            <Box sx={{ py: 3 }}>
              <Box
                sx={{
                  width: 64, height: 64, borderRadius: '50%', bgcolor: '#7fa176', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420', mb: 1 }}
              >
                Presença confirmada!
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#c15c71', fontSize: '1.1rem' }}>
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#4a3227', display: 'block', mt: 1 }}>
                {activeEvent?.title} — {eventDateStr} às {checkedInTime}
              </Typography>
              <Alert
                severity="success"
                icon={<FavoriteIcon sx={{ color: '#c15c71' }} />}
                sx={{ mt: 3, bgcolor: '#efe2c4', color: '#2a1420', fontWeight: 600 }}
              >
                Bom encontro! Que Santa Terezinha interceda por você hoje.
              </Alert>
            </Box>
          ) : !activeEvent ? (
            <Box sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420', mb: 1 }}>
                Nenhum evento ativo
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a3227' }}>
                Não há eventos com check-in aberto no momento. Aguarde as próximas comunicações da coordenação.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleCheckin}>
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '50%', bgcolor: '#c15c71', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <QrIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#2a1420' }}
              >
                Check-in de Presença
              </Typography>
              <Typography variant="body2" sx={{ color: '#4a3227', mt: 0.5, mb: 3 }}>
                {activeEvent.title} • {eventDateStr} • {activeEvent.location?.split('—')[0]?.trim()}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="Seu Nome Completo"
                  required
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você se chama?"
                />
                <TextField
                  label="WhatsApp (opcional)"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#2a1420', color: '#f7efdd', py: 1.5,
                  fontWeight: 800, borderRadius: 2,
                  '&:hover': { bgcolor: '#421a30' },
                }}
              >
                Confirmar Presença
              </Button>
              <Typography variant="caption" sx={{ color: '#4a3227', display: 'block', mt: 1.5 }}>
                Sem necessidade de login ou senha
              </Typography>
            </form>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PublicAttendanceCheckin;
