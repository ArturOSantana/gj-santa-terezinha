
export const TRANSACTION_CATEGORIES = {
  income: [
    { value: 'donation', label: 'Doação', icon: 'Favorite' },
    { value: 'event', label: 'Evento Especial', icon: 'Event' },
    { value: 'monthly_fee', label: 'Mensalidade', icon: 'Payments' },
    { value: 'other', label: 'Outros', icon: 'MoreHoriz' },
  ],
  expense: [
    { value: 'food', label: 'Lanches (Ágape)', icon: 'Fastfood' },
    { value: 'material', label: 'Materiais Formativos', icon: 'MenuBook' },
    { value: 'event', label: 'Evento', icon: 'Event' },
    { value: 'transport', label: 'Transporte', icon: 'DirectionsBus' },
    { value: 'other', label: 'Outros', icon: 'MoreHoriz' },
  ],
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  donation: 'Doação',
  event: 'Evento',
  monthly_fee: 'Mensalidade',
  food: 'Lanches (Ágape)',
  material: 'Materiais Formativos',
  transport: 'Transporte',
  other: 'Outros',
};

export const CATEGORY_ICONS: Record<string, string> = {
  donation: 'Favorite',
  event: 'Event',
  monthly_fee: 'Payments',
  food: 'Fastfood',
  material: 'MenuBook',
  transport: 'DirectionsBus',
  other: 'MoreHoriz',
};

export const TRANSACTION_COLORS = {
  income: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    bg: '#e8f5e9',
  },
  expense: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    bg: '#ffebee',
  },
  balance: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    bg: '#e3f2fd',
  },
} as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
] as const;

export const PERIOD_OPTIONS = [
  { value: 'current-month', label: 'Mês Atual' },
  { value: 'last-month', label: 'Mês Anterior' },
  { value: 'current-year', label: 'Ano Atual' },
  { value: 'last-3-months', label: 'Últimos 3 Meses' },
  { value: 'last-6-months', label: 'Últimos 6 Meses' },
  { value: 'all', label: 'Todo o Período' },
] as const;



export const EVENT_CATEGORIES = {
  saturday: { label: 'Sábado', color: '#2c5f2d' },
  solemnity: { label: 'Solenidade', color: '#d4af37' },
  saint_day: { label: 'Dia de Santo', color: '#9c27b0' },
  birthday: { label: 'Aniversário', color: '#ff9800' },
  parish_event: { label: 'Evento Paroquial', color: '#2196f3' },
  novena: { label: 'Novena', color: '#e91e63' },
} as const;

export const EVENT_CATEGORY_OPTIONS = [
  { value: 'saturday', label: 'Sábado' },
  { value: 'solemnity', label: 'Solenidade' },
  { value: 'saint_day', label: 'Dia de Santo' },
  { value: 'birthday', label: 'Aniversário' },
  { value: 'parish_event', label: 'Evento Paroquial' },
  { value: 'novena', label: 'Novena' },
] as const;
