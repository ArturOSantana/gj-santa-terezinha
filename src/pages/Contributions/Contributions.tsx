import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
} from '@mui/icons-material';

const Contributions = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 2,
            maxWidth: 500,
          }}
        >
          <ConstructionIcon
            sx={{
              fontSize: 80,
              color: '#d4af37',
              mb: 3,
            }}
          />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#2c5f2d' }}>
            Em Construção
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Esta página está sendo desenvolvida e estará disponível em breve.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Aqui você poderá fazer contribuições para o Grupo de Jovens.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Contributions;

// Made with Bob
