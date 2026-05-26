export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderWidth: {
    thin: 1,
    medium: 2,
    thick: 3,
  },

  iconSizes: {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  elevation: {
    low: '0 2px 4px rgba(26, 71, 49, 0.08)',
    medium: '0 4px 8px rgba(26, 71, 49, 0.12)',
    high: '0 8px 16px rgba(26, 71, 49, 0.16)',
  },
};

export type DesignTokens = typeof designTokens;
