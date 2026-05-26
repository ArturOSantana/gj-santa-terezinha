import { Card, CardContent, Box, Typography, useTheme, alpha } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, icon, color = 'primary', trend }: StatCardProps) => {
  const theme = useTheme();

  const getColor = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const cardColor = getColor();
  const colorLight = alpha(cardColor, 0.6);

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 2, md: 2.5 },
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.02)} 0%, transparent 100%)`,
        transition: 'all 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 3, md: 4 },
          background: `linear-gradient(90deg, ${cardColor} 0%, ${colorLight} 100%)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 150,
          height: 150,
          backgroundImage: 'url(/src/assets/brasao-gj.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03,
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: { xs: 'none', md: 'translateY(-4px)' },
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25, md: 2.5 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.72rem' },
                letterSpacing: '0.08em',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: trend ? { xs: 0.75, md: 1 } : 0,
                fontSize: { xs: '1.35rem', sm: '1.6rem', md: '2rem' },
                lineHeight: 1.15,
                wordBreak: 'break-word',
                fontFamily: 'Merriweather, serif',
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: trend.isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                >
                  em relação ao mês anterior
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(cardColor, 0.15)} 0%, ${alpha(cardColor, 0.05)} 100%)`,
              color: cardColor,
              flexShrink: 0,
              position: 'relative',
              '& svg': {
                fontSize: { xs: 28, sm: 30, md: 32 },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${alpha(cardColor, 0.3)}`,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;

