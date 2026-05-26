import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  Event as EventIcon,
  Payments as PaymentsIcon,
  Fastfood as FastfoodIcon,
  MenuBook as MenuBookIcon,
  DirectionsBus as DirectionsBusIcon,
  MoreHoriz as MoreHorizIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { Transaction, TransactionType } from '../../types';
import { CATEGORY_LABELS, TRANSACTION_COLORS } from '../../utils/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CATEGORY_ICON_COMPONENTS: Record<string, React.ElementType> = {
  donation: FavoriteIcon,
  event: EventIcon,
  monthly_fee: PaymentsIcon,
  food: FastfoodIcon,
  material: MenuBookIcon,
  transport: DirectionsBusIcon,
  other: MoreHorizIcon,
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) => {
  const theme = useTheme();
  const isIncome = transaction.type === TransactionType.INCOME;
  const colors = isIncome ? TRANSACTION_COLORS.income : TRANSACTION_COLORS.expense;
  
  const IconComponent = CATEGORY_ICON_COMPONENTS[transaction.category] || MoreHorizIcon;
  const TrendIcon = isIncome ? TrendingUpIcon : TrendingDownIcon;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return format(new Date(date), "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${colors.main} 0%, ${colors.light} 100%)`,
        },
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(colors.main, 0.2)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ pl: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${colors.main} 0%, ${colors.light} 100%)`,
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(colors.main, 0.3)}`,
                  flexShrink: 0,
                }}
              >
                <IconComponent sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'Merriweather, serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {transaction.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(transaction.date)}
                  </Typography>
                  <Chip
                    label={CATEGORY_LABELS[transaction.category]}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: alpha(colors.main, 0.1),
                      color: colors.dark,
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              {canEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(transaction)}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                  aria-label="Editar transação"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {canDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(transaction.id)}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                  aria-label="Excluir transação"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              pt: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: alpha(colors.main, 0.1),
                }}
              >
                <TrendIcon sx={{ fontSize: 16, color: colors.main }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: colors.dark,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {isIncome ? 'Entrada' : 'Saída'}
                </Typography>
              </Box>
              {transaction.paymentMethod && (
                <Chip
                  label={transaction.paymentMethod}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderStyle: 'dashed',
                    height: 24,
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Stack>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 1.5,
                background: `linear-gradient(135deg, ${alpha(colors.main, 0.1)} 0%, ${alpha(colors.main, 0.05)} 100%)`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: colors.main,
                  fontWeight: 700,
                  fontFamily: 'Merriweather, serif',
                }}
              >
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
              </Typography>
            </Box>
          </Box>

          {transaction.notes && (
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.grey[500], 0.05),
                borderRadius: 1.5,
                p: 1.5,
                borderLeft: `3px solid ${alpha(colors.main, 0.3)}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                <strong>Observações:</strong> {transaction.notes}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;

