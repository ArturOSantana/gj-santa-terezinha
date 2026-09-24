import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as AssignmentIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { TerezinhaService } from '../../services/firestore.service';
import { ScheduleAssignment, ScheduleStatus } from '../../types';

export const PublicScheduleResponse = () => {
  const { token } = useParams<{ token: string }>();
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleAssignment | null>(null);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [respondedStatus, setRespondedStatus] = useState<ScheduleStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadingSchedule(false);
      return;
    }
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      const data = await TerezinhaService.getScheduleByPublicToken(token);
      if (data) {
        setSchedule(data);
        if ((data as any).tokenUsed === true) {
          setAlreadyResponded(true);
          setRespondedStatus(data.status === ScheduleStatus.CONFIRMED ? ScheduleStatus.CONFIRMED : ScheduleStatus.DECLINED);
        }
      } else {
        setErrorMsg('Escala não encontrada ou link inválido.');
      }
      setLoadingSchedule(false);
    };
    loadSchedule();
  }, [token]);

  const handleRespond = async (status: ScheduleStatus) => {
    if (!token) return;
    try {
      setLoading(true);
      const updated = await TerezinhaService.respondSchedulePublicToken(token, status);
      if (updated) {
        setSchedule(updated);
        setRespondedStatus(status);
      } else {
        setErrorMsg('Link expirado ou escala já respondida.');
      }
    } catch {
      setErrorMsg('Erro ao registrar resposta da escala.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

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
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'rgba(193, 92, 113, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <AssignmentIcon sx={{ color: '#c15c71', fontSize: 28 }} />
          </Box>

          <Typography variant="caption" sx={{ color: '#d3a34c', fontWeight: 700, textTransform: 'uppercase' }}>
            Grupo de Jovens Santa Terezinha
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 700,
              mt: 0.5,
              mb: 2,
              color: '#2a1420',
            }}
          >
            Confirmação de Escala
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {loadingSchedule ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress sx={{ color: '#c15c71' }} />
            </Box>
          ) : respondedStatus ? (
            <Box sx={{ py: 2 }}>
              {respondedStatus === ScheduleStatus.CONFIRMED ? (
                <Box>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#4f6b4f', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4f6b4f' }}>
                    Presença Confirmada!
                  </Typography>
                  {schedule && (
                    <Typography variant="body2" sx={{ color: '#4a3227', mt: 1 }}>
                      <strong>{schedule.personName}</strong> — {schedule.role}
                      <br />
                      {schedule.eventTitle} • {formatDate(schedule.eventDate)}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#4a3227', mt: 1.5 }}>
                    {alreadyResponded ? 'Você já havia confirmado esta escala anteriormente.' : 'Obrigado por servir! Sua confirmação já foi atualizada para a coordenação.'}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CancelIcon sx={{ fontSize: 48, color: '#c15c71', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#c15c71' }}>
                    Escala Declinada
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4a3227', mt: 1 }}>
                    {alreadyResponded ? 'Você já havia declinado esta escala anteriormente.' : 'A coordenação foi informada para providenciar um substituto na equipe.'}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : schedule ? (
            <Box>
              {/* Dados reais da escala */}
              <Box
                sx={{
                  bgcolor: '#efe2c4',
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                    {schedule.personName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                  <Typography variant="body2" sx={{ color: '#4a3227' }}>
                    Equipe: <strong>{schedule.role}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 18, color: '#c15c71' }} />
                  <Typography variant="body2" sx={{ color: '#4a3227' }}>
                    {schedule.eventTitle} — {formatDate(schedule.eventDate)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: '#4a3227', mb: 3 }}>
                Por favor, confirme sua disponibilidade para servir neste encontro:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={!loading ? <CheckCircleIcon /> : undefined}
                  disabled={loading}
                  onClick={() => handleRespond(ScheduleStatus.CONFIRMED)}
                  sx={{
                    bgcolor: '#4f6b4f',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.4,
                    '&:hover': { bgcolor: '#3d543d' },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Confirmar Escala'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  onClick={() => handleRespond(ScheduleStatus.DECLINED)}
                  sx={{
                    borderColor: '#c15c71',
                    color: '#c15c71',
                    fontWeight: 700,
                    py: 1.4,
                    '&:hover': { bgcolor: 'rgba(193, 92, 113, 0.08)' },
                  }}
                >
                  Não Poderei Ir
                </Button>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default PublicScheduleResponse;
