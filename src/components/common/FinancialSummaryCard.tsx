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

  /**
   * Formata o valor monetário em Real brasileiro
   */
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
        background: `linear-gradient(135deg, ${colors.light}15 0%, ${colors.main}10 100%)`,
        borderLeft: `4px solid ${colors.main}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Cabeçalho com ícone e título */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, mb: 0.5 }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: colors.main,
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                }}
              >
                {formatCurrency(value)}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: colors.bg,
                borderRadius: '12px',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.main,
              }}
            >
              {icon}
            </Box>
          </Box>

          {/* Indicador de tendência (opcional) */}
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                pt: 1,
                borderTop: `1px solid ${colors.light}30`,
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
                  fontWeight: 600,
                }}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs. mês anterior
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;

