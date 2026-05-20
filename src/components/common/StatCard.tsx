import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
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

  // Obtém a cor do tema baseada na prop color
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

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'rgba(31, 41, 51, 0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 14px 28px rgba(31, 41, 51, 0.10)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: trend ? 1 : 0,
                fontSize: { xs: '1.6rem', sm: '2rem' },
                lineHeight: 1.15,
                wordBreak: 'break-word',
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
                  }}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: 3,
              backgroundColor: `${cardColor}14`,
              color: cardColor,
              flexShrink: 0,
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

