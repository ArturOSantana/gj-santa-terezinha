/**
 * Constantes do Sistema de Gestão do Grupo de Jovens
 * Paróquia Santa Terezinha
 */

/**
 * Categorias de Transações Financeiras
 * Organizadas por tipo (receita/despesa) com ícones e labels
 */
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

/**
 * Mapeamento de categorias para labels em português
 */
export const CATEGORY_LABELS: Record<string, string> = {
  donation: 'Doação',
  event: 'Evento',
  monthly_fee: 'Mensalidade',
  food: 'Lanches (Ágape)',
  material: 'Materiais Formativos',
  transport: 'Transporte',
  other: 'Outros',
};

/**
 * Mapeamento de categorias para ícones
 */
export const CATEGORY_ICONS: Record<string, string> = {
  donation: 'Favorite',
  event: 'Event',
  monthly_fee: 'Payments',
  food: 'Fastfood',
  material: 'MenuBook',
  transport: 'DirectionsBus',
  other: 'MoreHoriz',
};

/**
 * Cores para tipos de transação
 */
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

/**
 * Métodos de pagamento disponíveis
 */
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
] as const;

/**
 * Opções de período para filtros
 */
export const PERIOD_OPTIONS = [
  { value: 'current-month', label: 'Mês Atual' },
  { value: 'last-month', label: 'Mês Anterior' },
  { value: 'current-year', label: 'Ano Atual' },
  { value: 'last-3-months', label: 'Últimos 3 Meses' },
  { value: 'last-6-months', label: 'Últimos 6 Meses' },
  { value: 'all', label: 'Todo o Período' },
] as const;

// Made with Bob