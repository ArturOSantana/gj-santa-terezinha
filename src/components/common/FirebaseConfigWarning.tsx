import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Warning as WarningIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';

const FirebaseConfigWarning: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderTop: '4px solid',
            borderColor: 'error.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <WarningIcon sx={{ fontSize: 48, color: 'error.main', mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Firebase Não Configurado
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle sx={{ fontWeight: 600 }}>
              O sistema não pode funcionar sem o Firebase configurado
            </AlertTitle>
            A API Key do Firebase está inválida ou tem restrições que impedem seu uso.
          </Alert>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
            Como Resolver:
          </Typography>

          <List sx={{ mb: 3 }}>
            <ListItem>
              <ListItemText
                primary="1. Acesse o Google Cloud Console"
                secondary="https://console.cloud.google.com/"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Selecione o projeto: gj-santaterezinha"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Vá em: APIs e serviços → Credenciais"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="4. Edite: Browser key (auto created by Firebase)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="5. Em 'Restrições de aplicativo', adicione:"
                secondary="localhost:5173/*, localhost:3000/*, *.vercel.app/*"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="6. Salve e reinicie o servidor"
              />
            </ListItem>
          </List>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<OpenIcon />}
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Google Cloud Console
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<OpenIcon />}
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Firebase Console
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            <strong>Erro técnico:</strong> Firebase API Key não válida ou com restrições.
            <br />
            <strong>Código:</strong> auth/api-key-not-valid
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default FirebaseConfigWarning;
