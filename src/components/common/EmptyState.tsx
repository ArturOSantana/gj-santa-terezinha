import React from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          margin: '0 auto 3',
          opacity: 0.3,
          backgroundImage: 'url(/src/assets/brasao-gj.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
      <Typography
        variant="h3"
        sx={{
          mb: 2,
          color: 'text.secondary',
          fontWeight: 600,
          fontFamily: 'Merriweather, serif',
          fontSize: '1.5rem',
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {description}
        </Typography>
      )}
      {action && <Box>{action}</Box>}
    </Box>
  );
};

export default EmptyState;

