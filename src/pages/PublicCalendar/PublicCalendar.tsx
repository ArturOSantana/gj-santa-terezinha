import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarAddIcon,
  CalendarMonth as CalendarMonthIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TerezinhaService } from '../../services/firestore.service';
import { GoogleCalendarService } from '../../services/googleCalendar.service';
import { Event } from '../../types';
import { printBeautifulCalendar, generateFullCalendarICS } from '../../utils/calendarExport';

/** Gera e faz download de um arquivo .ics para o evento */
function downloadICS(evt: Event) {
  const pad = (n: number) => String(n).padStart(2, '0');

  const toICSDate = (date: Date, time?: string): string => {
    const [h = '00', m = '00'] = (time ?? '00:00').split(':');
    const y = date.getFullYear();
    const mo = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    return `${y}${mo}${d}T${h}${m}00`;
  };

  const dateObj = evt.date instanceof Date ? evt.date : new Date(evt.date);
  const dtStart = toICSDate(dateObj, evt.startTime);
  const dtEnd = evt.endTime ? toICSDate(dateObj, evt.endTime) : toICSDate(dateObj, evt.startTime);
  const uid = `${evt.id}@gjsantaterezinha`;
  const now = new Date();
  const dtstamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GJ Santa Terezinha//Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${evt.title}`,
    `DESCRIPTION:${(evt.description ?? '').replace(/\n/g, '\\n')}`,
    `LOCATION:${evt.location ?? ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${evt.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export const PublicCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    const loadAllPublicEvents = async () => {
      try {
        const firestoreEvents = await TerezinhaService.getEvents();
        
        let googleEvents: any[] = [];
        try {
          googleEvents = await GoogleCalendarService.fetchEvents();
        } catch (error) {
          console.error('Erro ao buscar eventos do Google Calendar:', error);
        }
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Tratar eventos do Firestore (filtrar públicos e futuros)
        const publicFirestore = firestoreEvents.filter((e) => e.isPublic && new Date(e.date) >= now);
        
        // Tratar eventos do Google Calendar (todos do Google Calendar são públicos e futuros)
        const publicGoogle = googleEvents.map((ge, index) => ({
          ...ge,
          id: ge.id || `google-${index}-${Date.now()}`,
          isPublic: true,
          date: new Date(ge.date),
        })).filter((e) => new Date(e.date) >= now);
        
        // Mesclar e ordenar
        const merged = [...publicFirestore, ...publicGoogle];
        merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Deduplicar por id
        const seen = new Set<string>();
        const uniqueUpcoming = merged.filter((e) => {
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
        
        setEvents(uniqueUpcoming);
      } catch (error) {
        console.error('Erro ao carregar eventos da agenda:', error);
      }
    };
    
    loadAllPublicEvents();
  }, []);

  const handleAddToCalendar = (evt: Event) => {
    downloadICS(evt);
    setSnackOpen(true);
  };

  const handleShare = () => {
    const text = `*Agenda Oficial — Grupo de Jovens Santa Terezinha*\nConfira nossos próximos encontros e retiros:\n${window.location.origin}/p/agenda`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#241019',
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 640 }}>
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/')}
            sx={{ color: '#e2cad2', fontSize: '0.8rem' }}
          >
            Início
          </Button>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => printBeautifulCalendar(events, 'Agenda Oficial — Grupo de Jovens Santa Terezinha')}
              sx={{ borderColor: '#d3a34c', color: '#d3a34c', textTransform: 'none', borderRadius: 2 }}
            >
              Imprimir / PDF
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                generateFullCalendarICS(events, 'Agenda GJ Santa Terezinha');
                setSnackOpen(true);
              }}
              sx={{ borderColor: '#e2cad2', color: '#e2cad2', textTransform: 'none', borderRadius: 2 }}
            >
              Baixar .ICS
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{ borderColor: '#7fa176', color: '#7fa176', textTransform: 'none', borderRadius: 2 }}
            >
              WhatsApp
            </Button>
          </Box>
        </Box>

        {/* Hero Card */}
        <Box
          sx={{
            textAlign: 'center',
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: '#2f1522',
            border: '1px solid rgba(211, 163, 76, 0.2)',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: 'rgba(193, 92, 113, 0.2)',
              border: '1px solid rgba(193, 92, 113, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <CalendarMonthIcon sx={{ color: '#c15c71', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 700,
              color: '#f4e6e9',
              fontSize: { xs: '1.6rem', sm: '2rem' },
            }}
          >
            Grupo de Jovens Santa Terezinha
          </Typography>
          <Typography variant="body2" sx={{ color: '#e2cad2', mt: 0.5 }}>
            Agenda aberta de encontros, formações, missas e retiros
          </Typography>
        </Box>

        {/* Lista de Eventos Públicos */}
        <Typography
          variant="subtitle1"
          sx={{
            color: '#d3a34c',
            fontWeight: 700,
            mb: 2,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
          }}
        >
          Próximos Encontros
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.map((evt) => {
            const dateObj = evt.date instanceof Date ? evt.date : new Date(evt.date);
            const day = dateObj.getDate();
            const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

            return (
              <Box
                key={evt.id}
                sx={{
                  bgcolor: '#f7efdd',
                  color: '#2a1420',
                  p: 2.5,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  gap: 2.5,
                  alignItems: 'center',
                  border: '1px solid rgba(211, 163, 76, 0.2)',
                }}
              >
                {/* Bloco Data */}
                <Box
                  sx={{
                    bgcolor: '#2a1420',
                    color: '#f7efdd',
                    p: 1.5,
                    borderRadius: 2,
                    textAlign: 'center',
                    minWidth: 64,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, lineHeight: 1 }}
                  >
                    {day}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#d3a34c', fontSize: '0.7rem' }}>
                    {monthName}
                  </Typography>
                </Box>

                {/* Info */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: '1.1rem', color: '#2a1420' }}
                  >
                    {evt.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 16, color: '#c15c71' }} />
                      <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                        {evt.startTime} {evt.endTime && `• ${evt.endTime}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: '#c15c71' }} />
                      <Typography variant="caption" sx={{ color: '#4a3227' }}>
                        {evt.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Ações: Ver Convite + Adicionar ao Calendário */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  {evt.publicSlug && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/p/${evt.publicSlug}`)}
                      sx={{
                        bgcolor: '#c15c71',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: 1.5,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#9a3450' },
                      }}
                    >
                      Ver Convite
                    </Button>
                  )}
                  <Tooltip title="Adicionar ao meu calendário" placement="left">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CalendarAddIcon sx={{ fontSize: 15 }} />}
                      onClick={() => handleAddToCalendar(evt)}
                      sx={{
                        borderColor: '#7fa176',
                        color: '#7fa176',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(127, 161, 118, 0.12)', borderColor: '#7fa176' },
                      }}
                    >
                      + Calendário
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="success"
          variant="filled"
          sx={{ bgcolor: '#7fa176', color: '#fff', fontWeight: 600 }}
        >
          Evento adicionado ao seu calendário!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicCalendar;
