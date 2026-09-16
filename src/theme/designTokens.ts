export const designTokens = {
  colors: {
    bg: '#241019',
    bgSoft: '#2f1522',
    onBg: '#ffffff',
    onBgDim: '#e2cad2',
    surface: '#f7efdd',
    surface2: '#efe2c4',
    ink: '#1c0c15',
    inkDim: '#4a3227',
    rose: '#c15c71',
    roseDeep: '#9a3450',
    gold: '#d3a34c',
    sage: '#7fa176',
    sageDeep: '#4f6b4f',
  },

  fonts: {
    serif: '"Fraunces", Georgia, serif',
    sans: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  elevation: {
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    raised: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
};

export type DesignTokens = typeof designTokens;
