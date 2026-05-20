import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { TRANSACTION_COLORS } from '../../utils/constants';

type FinancialCardType = 'income' | 'expense' | 'balance';

interface FinancialSummaryCardProps {
  title: string;
  value: number;
  type: FinancialCardType;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  title,
  value,
  type,
  icon,
  trend,
}) => {
  const colors = TRANSACTION_COLORS[type];

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: '#f7f2e8',
        border: `2px solid ${colors.main}`,
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: '#efe8da',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 700, mb: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.72rem' }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: colors.main,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.6rem', sm: '2rem' },
                  lineHeight: 1.15,
                  wordBreak: 'break-word',
                }}
              >
                {formatCurrency(value)}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: 'transparent',
                border: `2px solid ${colors.main}`,
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.main,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Box>

          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                pt: 1,
                borderTop: `1px solid ${colors.main}`,
                flexWrap: 'wrap',
              }}
            >
              {trend.isPositive ? (
                <TrendingUpIcon
                  sx={{
                    fontSize: 18,
                    color: TRANSACTION_COLORS.income.main,
                  }}
                />
              ) : (
                <TrendingDownIcon
                  sx={{
                    fontSize: 18,
                    color: TRANSACTION_COLORS.expense.main,
                  }}
                />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend.isPositive
                    ? TRANSACTION_COLORS.income.main
                    : TRANSACTION_COLORS.expense.main,
                  fontWeight: 700,
                }}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                em relação ao mês anterior
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;

