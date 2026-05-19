import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
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
} from '@mui/icons-material';
import { Transaction, TransactionType } from '../../types';
import { CATEGORY_LABELS, TRANSACTION_COLORS } from '../../utils/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Props do componente TransactionCard
 */
interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

/**
 * Mapeamento de categorias para componentes de ícone
 */
const CATEGORY_ICON_COMPONENTS: Record<string, React.ElementType> = {
  donation: FavoriteIcon,
  event: EventIcon,
  monthly_fee: PaymentsIcon,
  food: FastfoodIcon,
  material: MenuBookIcon,
  transport: DirectionsBusIcon,
  other: MoreHorizIcon,
};

/**
 * Componente TransactionCard
 * Exibe uma transação financeira com informações detalhadas
 */
const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const colors = isIncome ? TRANSACTION_COLORS.income : TRANSACTION_COLORS.expense;
  
  // Obtém o componente de ícone apropriado
  const IconComponent = CATEGORY_ICON_COMPONENTS[transaction.category] || MoreHorizIcon;

  /**
   * Formata o valor monetário em Real brasileiro
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /**
   * Formata a data da transação
   */
  const formatDate = (date: Date): string => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${colors.main}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Cabeçalho com ícone, categoria e ações */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  backgroundColor: colors.bg,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent sx={{ color: colors.main, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {transaction.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(transaction.date)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => onEdit(transaction)}
                sx={{
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.light' },
                }}
                aria-label="Editar transação"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(transaction.id)}
                sx={{
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.light' },
                }}
                aria-label="Excluir transação"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Informações da transação */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label={isIncome ? 'Entrada' : 'Saída'}
                size="small"
                sx={{
                  backgroundColor: colors.bg,
                  color: colors.dark,
                  fontWeight: 600,
                }}
              />
              <Chip
                label={CATEGORY_LABELS[transaction.category]}
                size="small"
                variant="outlined"
              />
              {transaction.paymentMethod && (
                <Chip
                  label={transaction.paymentMethod}
                  size="small"
                  variant="outlined"
                  sx={{ borderStyle: 'dashed' }}
                />
              )}
            </Stack>

            <Typography
              variant="h6"
              sx={{
                color: colors.main,
                fontWeight: 700,
              }}
            >
              {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
            </Typography>
          </Box>

          {/* Notas adicionais (se houver) */}
          {transaction.notes && (
            <Box
              sx={{
                backgroundColor: 'grey.50',
                borderRadius: 1,
                p: 1.5,
                mt: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
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

// Made with Bob