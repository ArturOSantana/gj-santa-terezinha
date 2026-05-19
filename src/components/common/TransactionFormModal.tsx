import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
  InputAdornment,
  Alert,
  Stack,
} from '@mui/material';
import { Transaction, TransactionType, TransactionCategory } from '../../types';
import { TRANSACTION_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { format } from 'date-fns';

interface TransactionFormModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  readOnly?: boolean;
}

interface FormData {
  type: TransactionType;
  category: TransactionCategory;
  amount: string;
  description: string;
  date: Date;
  paymentMethod: string;
  notes: string;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  open,
  transaction,
  onClose,
  onSave,
  readOnly = false,
}) => {
  const isEditing = !!transaction;

  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    type: TransactionType.INCOME,
    category: TransactionCategory.DONATION,
    amount: '',
    description: '',
    date: new Date(),
    paymentMethod: 'Dinheiro',
    notes: '',
  });

  // Estado de erros
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  /**
   * Preenche o formulário quando estiver editando
   */
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: new Date(transaction.date),
        paymentMethod: transaction.paymentMethod || 'Dinheiro',
        notes: transaction.notes || '',
      });
    } else {
      // Reset para valores padrão ao criar nova transação
      setFormData({
        type: TransactionType.INCOME,
        category: TransactionCategory.DONATION,
        amount: '',
        description: '',
        date: new Date(),
        paymentMethod: 'Dinheiro',
        notes: '',
      });
    }
    setErrors({});
  }, [transaction, open]);

  /**
   * Atualiza o tipo de transação e ajusta a categoria
   */
  const handleTypeChange = (type: TransactionType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      category:
        type === TransactionType.INCOME
          ? TransactionCategory.DONATION
          : TransactionCategory.FOOD,
    }));
  };

  /**
   * Valida o formulário
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (formData.date > new Date()) {
      newErrors.date = 'Data não pode ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submete o formulário
   */
  const handleSubmit = () => {
    if (readOnly) {
      handleClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim() || undefined,
    };

    onSave(transactionData);
    handleClose();
  };

  /**
   * Fecha o modal e limpa o formulário
   */
  const handleClose = () => {
    setFormData({
      type: TransactionType.INCOME,
      category: TransactionCategory.DONATION,
      amount: '',
      description: '',
      date: new Date(),
      paymentMethod: 'Dinheiro',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  /**
   * Formata a data para o input type="date"
   */
  const formatDateForInput = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  /**
   * Converte string do input para Date
   */
  const parseDateFromInput = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
  };

  // Obtém as categorias disponíveis baseado no tipo
  const availableCategories =
    formData.type === TransactionType.INCOME
      ? TRANSACTION_CATEGORIES.income
      : TRANSACTION_CATEGORIES.expense;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Transação' : 'Nova Transação'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {/* Tipo de Transação */}
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend">Tipo de Transação</FormLabel>
              <RadioGroup
                row
                value={formData.type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as TransactionType)
                }
              >
                <FormControlLabel
                  value={TransactionType.INCOME}
                  control={<Radio disabled={readOnly} />}
                  label="Entrada"
                />
                <FormControlLabel
                  value={TransactionType.EXPENSE}
                  control={<Radio disabled={readOnly} />}
                  label="Saída"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Categoria e Valor */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                label="Categoria"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as TransactionCategory,
                  }))
                }
                disabled={readOnly}
              >
                {availableCategories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              disabled={readOnly}
              error={!!errors.amount}
              helperText={errors.amount}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">R$</InputAdornment>
                  ),
                },
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
            />
          </Box>

          {/* Descrição */}
          <Box>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={readOnly}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Ex: Lanches para o encontro"
            />
          </Box>

          {/* Data e Método de Pagamento */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Data"
              type="date"
              value={formatDateForInput(formData.date)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date: parseDateFromInput(e.target.value),
                }))
              }
              disabled={readOnly}
              error={!!errors.date}
              helperText={errors.date}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                htmlInput: {
                  max: formatDateForInput(new Date()),
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Método de Pagamento</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Método de Pagamento"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                disabled={readOnly}
              >
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Observações */}
          <Box>
            <TextField
              fullWidth
              label="Observações (opcional)"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={readOnly}
              placeholder="Informações adicionais sobre a transação"
            />
          </Box>

          {/* Alerta de validação */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              Por favor, corrija os erros antes de salvar.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        {!readOnly && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Salvar Alterações' : 'Criar Transação'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TransactionFormModal;

