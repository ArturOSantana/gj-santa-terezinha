import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: {
      burgundy: string;
      cream: string;
      bronze: string;
    };
  }

  interface PaletteOptions {
    accent?: {
      burgundy: string;
      cream: string;
      bronze: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a4731',
      light: '#2d6b4a',
      dark: '#0f2e1f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b8860b',
      light: '#d4a843',
      dark: '#8b6914',
      contrastText: '#ffffff',
    },
    accent: {
      burgundy: '#6b1f3a',
      cream: '#f5f1e8',
      bronze: '#8c5a3c',
    },
    background: {
      default: '#faf8f3',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f1a17',
      secondary: '#5f564d',
    },
    success: {
      main: '#2e7d4f',
      light: '#4e9a6b',
      dark: '#1f5c39',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b23a48',
      light: '#cd5a67',
      dark: '#8a2430',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#c48a1c',
      light: '#dca53f',
      dark: '#966713',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b6f8e',
      light: '#5b8cab',
      dark: '#284f67',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "-apple-system", BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontFamily: '"Merriweather", serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Merriweather", serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontFamily: '"Merriweather", serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    subtitle1: {
      fontFamily: '"Merriweather", serif',
      lineHeight: 1.6,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(26, 71, 49, 0.06)',
    '0 4px 8px rgba(26, 71, 49, 0.08)',
    '0 6px 12px rgba(26, 71, 49, 0.10)',
    '0 8px 16px rgba(26, 71, 49, 0.12)',
    '0 10px 20px rgba(26, 71, 49, 0.14)',
    '0 12px 24px rgba(26, 71, 49, 0.16)',
    '0 14px 28px rgba(26, 71, 49, 0.18)',
    '0 16px 32px rgba(26, 71, 49, 0.20)',
    '0 18px 36px rgba(26, 71, 49, 0.22)',
    '0 20px 40px rgba(26, 71, 49, 0.24)',
    '0 22px 44px rgba(26, 71, 49, 0.26)',
    '0 24px 48px rgba(26, 71, 49, 0.28)',
    '0 26px 52px rgba(26, 71, 49, 0.30)',
    '0 28px 56px rgba(26, 71, 49, 0.32)',
    '0 30px 60px rgba(26, 71, 49, 0.34)',
    '0 32px 64px rgba(26, 71, 49, 0.36)',
    '0 34px 68px rgba(26, 71, 49, 0.38)',
    '0 36px 72px rgba(26, 71, 49, 0.40)',
    '0 38px 76px rgba(26, 71, 49, 0.42)',
    '0 40px 80px rgba(26, 71, 49, 0.44)',
    '0 42px 84px rgba(26, 71, 49, 0.46)',
    '0 44px 88px rgba(26, 71, 49, 0.48)',
    '0 46px 92px rgba(26, 71, 49, 0.50)',
    '0 48px 96px rgba(26, 71, 49, 0.52)',
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        body: {
          backgroundColor: '#faf8f3',
          color: '#1f1a17',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 18px',
          boxShadow: 'none',
          border: '1px solid transparent',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(26, 71, 49, 0.12)',
          backgroundImage: 'none',
          border: '1px solid rgba(26, 71, 49, 0.10)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(26, 71, 49, 0.10)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
    },
  },
});

export default theme;

