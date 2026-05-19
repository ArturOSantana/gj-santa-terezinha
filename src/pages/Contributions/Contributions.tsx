import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  TextField,
  Button,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Favorite as FavoriteIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const PIX_KEY = 'gjsantaterezinha@exemplo.com';
const PIX_NAME = 'Grupo de Jovens Santa Terezinha';

const Contributions = () => {
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const suggestedAmounts = [10, 20, 50, 100];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FavoriteIcon sx={{ color: 'error.main' }} />
          Contribuições
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sua contribuição ajuda o Grupo de Jovens a realizar encontros, formações e eventos especiais.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeIcon color="primary" />
              PIX Copia e Cola
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Use a chave PIX abaixo para fazer sua contribuição de forma rápida e segura.
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Chave PIX:
              </Typography>
              <TextField
                fullWidth
                value={PIX_KEY}
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleCopyPix}
                          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                          color={copied ? 'success' : 'primary'}
                          size="small"
                        >
                          {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Nome do Beneficiário:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {PIX_NAME}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Como contribuir:
            </Typography>
            <Box component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
              <li>
                <Typography variant="body2">
                  Copie a chave PIX acima
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Abra o aplicativo do seu banco
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Escolha a opção PIX e cole a chave
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Confirme o valor e finalize a transferência
                </Typography>
              </li>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Valores Sugeridos
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Escolha um valor ou digite o quanto deseja contribuir:
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
              {suggestedAmounts.map((value) => (
                <Card
                  key={value}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: amount === value.toString() ? 2 : 1,
                    borderColor: amount === value.toString() ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => setAmount(value.toString())}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" color="primary">
                      R$ {value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <TextField
              fullWidth
              label="Outro valor"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }
              }}
              type="number"
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Por que contribuir?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label="Formações" color="primary" size="small" />
                  <Typography variant="body2">
                    Materiais e recursos para encontros formativos
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label="Eventos" color="secondary" size="small" />
                  <Typography variant="body2">
                    Realização de retiros, acampamentos e celebrações
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label="Ágape" color="success" size="small" />
                  <Typography variant="body2">
                    Lanches e confraternizações nos encontros
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label="Missão" color="warning" size="small" />
                  <Typography variant="body2">
                    Ações sociais e missionárias da paróquia
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Alert severity="success" icon={<FavoriteIcon />}>
        <Typography variant="body2">
          <strong>Gratidão!</strong> Cada contribuição, independente do valor, faz toda a diferença 
          para o crescimento espiritual e comunitário do nosso Grupo de Jovens. Que Deus abençoe sua generosidade!
        </Typography>
      </Alert>
    </Container>
  );
};

export default Contributions;

// Made with Bob
