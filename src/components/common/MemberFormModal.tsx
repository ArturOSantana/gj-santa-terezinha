import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Member, MemberStatus } from '../../types';

interface MemberFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => void;
  member?: Member | null;
  readOnly?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  birthDate: Date | null;
  gender: 'male' | 'female' | '';
  status: MemberStatus;
  notes?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({
  open,
  onClose,
  onSave,
  member,
  readOnly = false,
}) => {
  const isEditing = !!member;

  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: null,
    gender: '',
    status: MemberStatus.ACTIVE,
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Preenche o formulário quando está editando
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        birthDate: member.birthDate,
        gender: member.gender,
        status: member.status,
        notes: member.notes || '',
      });
    } else {
      // Reseta o formulário quando não está editando
      setFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: null,
        gender: '',
        status: MemberStatus.ACTIVE,
        notes: '',
      });
    }
    setErrors({});
  }, [member, open]);

  /**
   * Valida o email
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Valida o telefone (formato brasileiro)
   */
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  /**
   * Valida a idade (14-22 anos)
   */
  const validateAge = (birthDate: Date): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 14 && age <= 22;
  };

  /**
   * Valida o formulário
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Telefone
    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Formato: (XX) XXXXX-XXXX';
    }

    // Data de nascimento
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (!validateAge(formData.birthDate)) {
      newErrors.birthDate = 'Idade deve estar entre 14 e 22 anos';
    }

    // Gênero
    if (!formData.gender) {
      newErrors.gender = 'Gênero é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Formata o telefone enquanto digita
   */
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  /**
   * Manipula mudanças nos campos
   */
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Manipula mudanças no telefone com formatação
   */
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleChange('phone', formatted);
  };

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = () => {
    if (readOnly) {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    const memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone,
      birthDate: formData.birthDate!,
      gender: formData.gender as 'male' | 'female',
      joinDate: member?.joinDate || new Date(),
      status: formData.status,
      role: member?.role || 'member',
      notes: formData.notes?.trim() || undefined,
      photoUrl: member?.photoUrl,
    };

    onSave(memberData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="member-form-dialog-title"
    >
      <DialogTitle id="member-form-dialog-title">
        {isEditing ? 'Editar Membro' : 'Novo Membro'}
      </DialogTitle>
      
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Stack spacing={2}>
            {/* Informações Básicas */}
            <Typography variant="subtitle2" color="primary">
              Informações Básicas
            </Typography>

            <TextField
              fullWidth
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={readOnly}
              error={!!errors.name}
              helperText={errors.name}
              required
              autoFocus
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={readOnly}
                error={!!errors.email}
                helperText={errors.email}
                required
              />

              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                disabled={readOnly}
                error={!!errors.phone}
                helperText={errors.phone || '(XX) XXXXX-XXXX'}
                required
                slotProps={{
                  htmlInput: { maxLength: 15 }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <DatePicker
                label="Data de Nascimento"
                value={formData.birthDate}
                onChange={(date) => handleChange('birthDate', date)}
                disabled={readOnly}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.birthDate,
                    helperText: errors.birthDate || 'Idade: 14-22 anos',
                  },
                }}
                maxDate={new Date()}
              />

              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel>Gênero</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={readOnly}
                  label="Gênero"
                >
                  <MenuItem value="male">Cavalheiros</MenuItem>
                  <MenuItem value="female">Santa Joana</MenuItem>
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <FormControl fullWidth sx={{ maxWidth: { sm: 'calc(50% - 8px)' } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={readOnly}
                label="Status"
              >
                <MenuItem value={MemberStatus.ACTIVE}>Ativo</MenuItem>
                <MenuItem value={MemberStatus.INACTIVE}>Inativo</MenuItem>
                <MenuItem value={MemberStatus.SUSPENDED}>Suspenso</MenuItem>
              </Select>
            </FormControl>

            {/* Observações */}
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={readOnly}
              placeholder="Informações adicionais sobre o membro..."
            />
          </Stack>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        {!readOnly && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Salvar Alterações' : 'Adicionar Membro'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MemberFormModal;

