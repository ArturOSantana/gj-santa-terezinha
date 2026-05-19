import { Box, CircularProgress } from '@mui/material';

/**
 * Componente de Loading Spinner
 * Exibe um spinner de carregamento centralizado
 */
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

const LoadingSpinner = ({ size = 40, message }: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {message}
        </Box>
      )}
    </Box>
  );
};

export default LoadingSpinner;

// Made with Bob