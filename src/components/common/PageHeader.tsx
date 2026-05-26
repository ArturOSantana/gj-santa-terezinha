import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <Box
      sx={{
        mb: { xs: 3, md: 4 },
        pb: { xs: 2, md: 3 },
        borderBottom: '2px solid',
        borderColor: 'divider',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -2,
          left: 0,
          width: { xs: 40, md: 60 },
          height: 2,
          background: 'linear-gradient(90deg, #b8860b 0%, #d4a843 100%)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 700,
              color: 'primary.main',
              mb: subtitle ? { xs: 0.5, md: 1 } : 0,
              fontFamily: 'Merriweather, serif',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: { xs: '0.875rem', md: '1rem' },
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box
            sx={{
              width: { xs: '100%', md: 'auto' },
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
