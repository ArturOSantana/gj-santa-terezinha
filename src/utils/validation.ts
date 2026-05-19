
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  if (password.length < 6) return false;
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
};

export const getPasswordErrorMessage = (password: string): string => {
  if (password.length < 6) {
    return 'A senha deve ter no mínimo 6 caracteres';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra';
  }
  if (!/\d/.test(password)) {
    return 'A senha deve conter pelo menos um número';
  }
  return '';
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 3;
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return cpf;
};

export const isValidCEP = (cep: string): boolean => {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
};

export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return cep;
};

