import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Church as ChurchIcon,
  AppRegistration as AppRegistrationIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { TerezinhaService } from '../../services/firestore.service';
import { Event, PaymentStatus, RegistrationSourceProvider } from '../../types';

export const PublicEventInvitation = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [toast, setToast] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [dietary, setDietary] = useState('');
  const [emergency, setEmergency] = useState('');

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    const loadEvent = async () => {
      setLoading(true);
      const evt = await TerezinhaService.getEventBySlug(slug);
      if (evt) {
        setEvent(evt);
        const regs = await TerezinhaService.getRegistrationsByEvent(evt.id);
        setRegistrationCount(regs.length);
      }
      setLoading(false);
    };
    loadEvent();
  }, [slug]);

  const handleShareWhatsApp = () => {
    if (!event) return;
    const link = `${window.location.origin}/p/${event.publicSlug || event.id}`;
    const dateStr = new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    const text = `*${event.title} — Grupo de Jovens Santa Terezinha*\n${event.themeVerse ? `_${event.themeVerse}_\n\n` : '\n'}Data: ${dateStr}\nLocal: ${event.location}\n${event.price ? `Valor: R$ ${event.price.toFixed(2).replace('.', ',')}\n` : ''}\nInscrições abertas sem necessidade de login:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const safeName = name.trim().slice(0, 100);
    const safePhone = phone.replace(/[^\d\s()\-+]/g, '').trim().slice(0, 25);
    const safeGuardianName = guardianName.trim().slice(0, 100);
    const safeGuardianPhone = guardianPhone.replace(/[^\d\s()\-+]/g, '').trim().slice(0, 25);
    const safeDietary = dietary.trim().slice(0, 300);
    const safeEmergency = emergency.trim().slice(0, 150);
    const parsedAge = Number(age);
    const safeAge = parsedAge > 0 && parsedAge < 120 ? parsedAge : undefined;

    if (safeName.length < 3 || safePhone.length < 8) return;

    await TerezinhaService.createRegistration({
      eventId: event.id,
      name: safeName,
      phone: safePhone,
      age: safeAge,
      guardianName: safeGuardianName || undefined,
      guardianPhone: safeGuardianPhone || undefined,
      dietaryRestrictions: safeDietary || undefined,
      emergencyContact: safeEmergency || undefined,
      parish: 'Santa Terezinha',
      source: RegistrationSourceProvider.PUBLIC_PAGE,
      paymentStatus: PaymentStatus.PENDING,
      amountPaid: 0,
      totalAmount: event.price || 0,
      confirmed: false,
    });

    setRegistrationCount((c) => c + 1);
    setOpenModal(false);
    setToast(true);
    setName(''); setPhone(''); setAge(''); setGuardianName('');
    setGuardianPhone(''); setDietary(''); setEmergency('');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#241019', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#c15c71' }} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#241019', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography variant="h5" sx={{ color: '#f4e6e9', fontFamily: '"Fraunces", serif', mb: 2 }}>
          Evento não encontrado
        </Typography>
        <Button onClick={() => navigate('/')} sx={{ color: '#d3a34c' }}>Voltar ao início</Button>
      </Box>
    );
  }

  const isRetiro = event.category === 'retreat';
  const dateStart = new Date(event.date);
  const dateEnd = event.endDate ? new Date(event.endDate) : null;
  const formatDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase();
  const maxVagas = event.maxParticipants || 0;
  const vagasText = maxVagas > 0
    ? `${registrationCount} / ${maxVagas} Vagas`
    : `${registrationCount} inscritos`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#241019',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480, mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/')}
          sx={{ color: '#e2cad2', fontSize: '0.8rem' }}
        >
          Início
        </Button>
        <Typography variant="caption" sx={{ color: '#d3a34c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <ChurchIcon sx={{ fontSize: 16 }} /> Link Público para Jovens
        </Typography>
      </Box>

      {/* Cartão Convite Evento */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: '18px',
          overflow: 'hidden',
          bgcolor: '#f7efdd',
          color: '#2a1420',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(211, 163, 76, 0.3)',
        }}
      >
        {/* Hero Topo */}
        <Box
          sx={{
            bgcolor: '#2f1522',
            color: '#ffffff',
            p: 4,
            textAlign: 'center',
            borderBottom: '1px solid rgba(211, 163, 76, 0.2)',
          }}
        >
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '10px',
              bgcolor: 'rgba(193, 92, 113, 0.2)',
              border: '1px solid rgba(193, 92, 113, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <ChurchIcon sx={{ color: '#c15c71', fontSize: 24 }} />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: '#d3a34c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}
          >
            Grupo de Jovens Santa Terezinha
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.2rem' }, lineHeight: 1.15, mb: 1 }}
          >
            {event.title}
          </Typography>
          {event.themeVerse && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#f4e6e9', fontSize: '0.95rem', maxWidth: 320, mx: 'auto' }}>
              {event.themeVerse}
            </Typography>
          )}

          {/* Datas */}
          <Box
            sx={{
              mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#e2cad2', display: 'block', textTransform: 'uppercase' }}>
                {dateEnd ? 'Início' : 'Data'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>
                {formatDate(dateStart)} • {event.startTime}
              </Typography>
            </Box>
            {dateEnd && (
              <>
                <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.2)' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#e2cad2', display: 'block', textTransform: 'uppercase' }}>
                    Encerramento
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff' }}>
                    {formatDate(dateEnd)} • {event.endTime}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Corpo do Convite */}
        <Box sx={{ p: 3.5 }}>
          {/* Preço & Vagas (só para eventos pagos ou com limite) */}
          {(event.price || maxVagas > 0) && (
            <Box
              sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                mb: 3, pb: 2, borderBottom: '1px solid rgba(107, 83, 71, 0.15)',
              }}
            >
              {event.price ? (
                <Box>
                  <Typography variant="caption" sx={{ color: '#4a3227', display: 'block' }}>Investimento</Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, color: '#2a1420', fontVariantNumeric: 'tabular-nums' }}
                  >
                    R$ {event.price.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
              ) : <Box />}
              {maxVagas > 0 && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#4a3227', display: 'block' }}>Inscrições</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#c15c71' }}>
                    {vagasText}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Local & Detalhes */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationIcon sx={{ color: '#c15c71', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 600 }}>
                {event.location}
              </Typography>
            </Box>
            {event.description && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CalendarIcon sx={{ color: '#c15c71', fontSize: 20, mt: 0.2 }} />
                <Typography variant="body2" sx={{ color: '#4a3227', lineHeight: 1.5 }}>
                  {event.description}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Botão de Inscrição */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setOpenModal(true)}
            sx={{
              bgcolor: '#2a1420', color: '#f7efdd', py: 1.6,
              fontSize: '1rem', fontWeight: 800, borderRadius: 2,
              '&:hover': { bgcolor: '#421a30' }, mb: 1.5,
            }}
          >
            Quero me inscrever
          </Button>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textAlign: 'center', color: '#4a3227', mb: 2 }}>
            <CheckIcon sx={{ fontSize: 14, color: '#4f6b4f' }} /> Inscrição rápida sem necessidade de criar conta ou login
          </Typography>

          {/* Compartilhar no WhatsApp */}
          <Button
            fullWidth
            variant="outlined"
            size="medium"
            startIcon={<ShareIcon />}
            onClick={handleShareWhatsApp}
            sx={{
              borderColor: '#7fa176', color: '#4f6b4f', fontWeight: 700,
              borderRadius: 2, py: 1.2,
              '&:hover': { borderColor: '#4f6b4f', bgcolor: 'rgba(127, 161, 118, 0.1)' },
            }}
          >
            Compartilhar no WhatsApp
          </Button>
        </Box>
      </Box>

      {/* Modal de Inscrição */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3 } }}>
        <form onSubmit={handleRegister}>
          <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, borderBottom: '1px solid rgba(107, 83, 71, 0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AppRegistrationIcon sx={{ color: '#c15c71' }} /> Inscrição — {event.title}
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nome Completo" required fullWidth value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
            <TextField label="WhatsApp (com DDD)" required fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            <TextField label="Idade" type="number" fullWidth value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 18" />
            {Number(age) > 0 && Number(age) < 18 && (
              <Box sx={{ bgcolor: '#efe2c4', p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#c15c71', fontWeight: 700 }}>
                  * Menores de 18 anos precisam informar dados do responsável:
                </Typography>
                <TextField label="Nome do Pai/Mãe ou Responsável" size="small" fullWidth value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
                <TextField label="WhatsApp do Responsável" size="small" fullWidth value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
              </Box>
            )}
            {isRetiro && (
              <>
                <TextField label="Restrições Alimentares / Alergias" fullWidth value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="Ex: Vegetariano, intolerância a lactose, nenhuma..." />
                <TextField label="Contato de Emergência (Nome e Tel)" fullWidth value={emergency} onChange={(e) => setEmergency(e.target.value)} placeholder="Ex: Mãe (11) 98888-7777" />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(107, 83, 71, 0.2)' }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: '#4a3227' }}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, px: 3, fontWeight: 700 }}>
              Confirmar Inscrição
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={toast} autoHideDuration={4000} onClose={() => setToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" icon={<CheckIcon sx={{ color: '#fff' }} />} sx={{ bgcolor: '#7fa176', color: '#fff', fontWeight: 700 }}>
          Inscrição confirmada! A coordenação entrará em contato pelo WhatsApp.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicEventInvitation;
