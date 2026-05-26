import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Refresh,
  WhatsApp,
  Email,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useBoaNova } from '../../../hooks/useBoaNova';
import type { BroadcastChannel, BroadcastStatus } from '../../../types/boanova.types';

const getStatusIcon = (status: BroadcastStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle color="success" />;
    case 'failed':
      return <ErrorIcon color="error" />;
    case 'sending':
      return <CircularProgress size={20} />;
    case 'scheduled':
      return <Schedule color="info" />;
    case 'cancelled':
      return <Cancel color="disabled" />;
    default:
      return <Schedule color="disabled" />;
  }
};

const getStatusLabel = (status: BroadcastStatus) => {
  const labels: Record<BroadcastStatus, string> = {
    draft: 'Rascunho',
    scheduled: 'Agendado',
    sending: 'Enviando',
    completed: 'Concluído',
    failed: 'Falhou',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
};

const getStatusColor = (status: BroadcastStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'sending':
      return 'info';
    case 'scheduled':
      return 'warning';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

export const BroadcastHistory: React.FC = () => {
  const { broadcasts, loading, error, loadBroadcasts, stats } = useBoaNova();
  const [filterChannel, setFilterChannel] = React.useState<BroadcastChannel | 'all'>('all');

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const handleRefresh = () => {
    loadBroadcasts(filterChannel === 'all' ? undefined : filterChannel);
  };

  const handleFilterChange = (_event: React.SyntheticEvent, newValue: BroadcastChannel | 'all') => {
    setFilterChannel(newValue);
    loadBroadcasts(newValue === 'all' ? undefined : newValue);
  };

  const filteredBroadcasts = filterChannel === 'all' 
    ? broadcasts 
    : broadcasts.filter(b => b.channel === filterChannel);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" color="primary">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Total</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" color="success.main">{stats.sent}</Typography>
            <Typography variant="body2" color="text.secondary">Enviados</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" color="error.main">{stats.failed}</Typography>
            <Typography variant="body2" color="text.secondary">Falhas</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
            <Typography variant="body2" color="text.secondary">Pendentes</Typography>
          </Paper>
        </Box>
      )}

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Histórico de Envios</Typography>
          <Tooltip title="Atualizar">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Tabs value={filterChannel} onChange={handleFilterChange} sx={{ px: 2 }}>
          <Tab label="Todos" value="all" />
          <Tab icon={<WhatsApp />} label="WhatsApp" value="whatsapp" />
          <Tab icon={<Email />} label="E-mail" value="email" />
        </Tabs>
      </Paper>

      {loading && broadcasts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredBroadcasts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum broadcast encontrado
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Canal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Mensagem</TableCell>
                <TableCell align="center">Destinatários</TableCell>
                <TableCell align="center">Enviados</TableCell>
                <TableCell align="center">Falhas</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBroadcasts.map((broadcast) => (
                <TableRow key={broadcast.id} hover>
                  <TableCell>
                    <Chip
                      icon={broadcast.channel === 'whatsapp' ? <WhatsApp /> : <Email />}
                      label={broadcast.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                      size="small"
                      color={broadcast.channel === 'whatsapp' ? 'success' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(broadcast.status)}
                      <Chip
                        label={getStatusLabel(broadcast.status)}
                        size="small"
                        color={getStatusColor(broadcast.status)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {broadcast.subject || broadcast.message?.substring(0, 50) + '...'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {broadcast.recipients.total}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="success.main">
                      {broadcast.recipients.sent}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="error.main">
                      {broadcast.recipients.failed}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(broadcast.createdAt).toLocaleString('pt-BR')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// Made with Bob
