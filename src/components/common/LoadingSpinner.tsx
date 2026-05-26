import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

const LoadingSpinner = ({ size = 60, message = 'Carregando...' }: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'secondary.main',
            opacity: 0.3,
          }}
        />
      </Box>
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontFamily: 'Merriweather, serif',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;

