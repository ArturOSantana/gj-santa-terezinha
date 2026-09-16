
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
  formation: { label: 'Formação', color: '#2c5f2d' },
  mass: { label: 'Missa', color: '#d4af37' },
  meeting: { label: 'Encontro', color: '#9c27b0' },
  retreat: { label: 'Retiro', color: '#ff9800' },
  outing: { label: 'Passeio', color: '#4caf50' },
  leadership_meeting: { label: 'Reunião de Liderança', color: '#3f51b5' },
  pastoral: { label: 'Pastoral', color: '#009688' },
  parish: { label: 'Paróquia', color: '#2196f3' },
  schedule: { label: 'Escala', color: '#795548' },
  deadline: { label: 'Prazo', color: '#f44336' },
  gj_meeting: { label: 'Encontro GJ', color: '#e91e63' },
  other: { label: 'Outro', color: '#607d8b' },
} as const;

export const EVENT_CATEGORY_OPTIONS = [
  { value: 'formation', label: 'Formação' },
  { value: 'mass', label: 'Missa' },
  { value: 'meeting', label: 'Encontro' },
  { value: 'retreat', label: 'Retiro' },
  { value: 'outing', label: 'Passeio' },
  { value: 'leadership_meeting', label: 'Reunião de Liderança' },
  { value: 'pastoral', label: 'Pastoral' },
  { value: 'parish', label: 'Paróquia' },
  { value: 'schedule', label: 'Escala' },
  { value: 'deadline', label: 'Prazo' },
  { value: 'gj_meeting', label: 'Encontro GJ' },
  { value: 'other', label: 'Outro' },
] as const;

export const ACTIVITY_TYPES = {
  spirituality: { label: 'Espiritualidade', icon: 'Church' },
  fellowship: { label: 'Convivência', icon: 'Groups' },
  formation: { label: 'Formação', icon: 'School' },
  deepening: { label: 'Aprofundamento', icon: 'MenuBook' },
} as const;

export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'spirituality', label: 'Espiritualidade' },
  { value: 'fellowship', label: 'Convivência' },
  { value: 'formation', label: 'Formação' },
  { value: 'deepening', label: 'Aprofundamento' },
] as const;
