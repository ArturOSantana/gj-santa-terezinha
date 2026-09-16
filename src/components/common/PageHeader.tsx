import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, action }) => {
  return (
    <Box
      sx={{
        mb: { xs: 3, md: 4 },
        pb: { xs: 2, md: 2.5 },
        borderBottom: '1px solid rgba(211, 163, 76, 0.2)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: { xs: 40, md: 60 },
          height: 2,
          background: 'linear-gradient(90deg, #c15c71 0%, #d3a34c 100%)',
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
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              fontWeight: 700,
              color: '#f4e6e9',
              mb: 0,
              fontFamily: '"Fraunces", Georgia, serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
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
