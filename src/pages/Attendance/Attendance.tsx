import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
} from '@mui/material';
import {
  QrCode2 as QrIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { TerezinhaService } from '../../services/firestore.service';
import { AttendanceRecord } from '../../types';

export const AttendancePage = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [openQrModal, setOpenQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkinUrl = `${window.location.origin}/p/checkin`;

  useEffect(() => {
    loadAttendance();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAttendance = async () => {
    const list = await TerezinhaService.getAttendanceRecords();
    setAttendance(list);
  };

  const handleOpenQR = () => {
    setOpenQrModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#f4e6e9' }}>
            Presenças & Frequência Pastoral
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<QrIcon />}
          onClick={handleOpenQR}
          sx={{ bgcolor: '#c15c71', color: '#fff', '&:hover': { bgcolor: '#9a3450' }, fontWeight: 700 }}
        >
          Projetar QR Code do Encontro
        </Button>
      </Box>

      {/* Check-ins do Encontro Atual */}
      <Box
        sx={{
          bgcolor: '#f7efdd',
          color: '#2a1420',
          p: 3,
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700 }}>
            Check-ins Registrados
          </Typography>
          <Chip label={`${attendance.length} Jovens Presentes`} size="small" sx={{ bgcolor: '#7fa176', color: '#fff', fontWeight: 700 }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {attendance.map((att) => (
            <Box
              key={att.id}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#ffffff',
                border: '1px solid rgba(107, 83, 71, 0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckIcon sx={{ color: '#7fa176', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2a1420' }}>
                    {att.personName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4a3227' }}>
                    {att.phone || 'Sem telefone'} • Via {att.method === 'qr_code' ? 'QR Code' : 'Registro Manual'}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#4a3227', fontWeight: 600 }}>
                {new Date(att.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Modal QR Code Grande na Tela */}
      <Dialog open={openQrModal} onClose={() => setOpenQrModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#f7efdd', color: '#2a1420', borderRadius: 3, textAlign: 'center', p: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <QrIcon sx={{ color: '#c15c71' }} /> Escaneie para Confirmar Presença
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              display: 'inline-block',
            }}
          >
            {/* QR Code real via Google Charts API pública — sem autenticação */}
            <img
              src={`https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(checkinUrl)}&choe=UTF-8`}
              alt="QR Code Check-in"
              width={220}
              height={220}
              style={{ borderRadius: 8, display: 'block' }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: '#2a1420', fontWeight: 600 }}>
            GJ Santa Terezinha — Paróquia Santa Terezinha
          </Typography>
          <Typography variant="caption" sx={{ color: '#4a3227' }}>
            O jovem abre no celular, digita o nome e confirma sem precisar de senha ou aplicativo.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => window.open(checkinUrl, '_blank')}
              sx={{ borderColor: '#c15c71', color: '#c15c71', fontWeight: 700 }}
            >
              Abrir em nova aba
            </Button>
            <Button
              variant="outlined"
              startIcon={<CopyIcon sx={{ fontSize: 16 }} />}
              onClick={handleCopyLink}
              sx={{ borderColor: '#d3a34c', color: '#d3a34c', fontWeight: 700 }}
            >
              Copiar Link
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={copied}
        message="Link copiado! Cole no WhatsApp ou projetor."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default AttendancePage;
