import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    terezinha: {
      bg: string;
      bgSoft: string;
      onBg: string;
      onBgDim: string;
      surface: string;
      surface2: string;
      ink: string;
      inkDim: string;
      rose: string;
      roseDeep: string;
      gold: string;
      sage: string;
      sageDeep: string;
    };
  }

  interface PaletteOptions {
    terezinha?: {
      bg: string;
      bgSoft: string;
      onBg: string;
      onBgDim: string;
      surface: string;
      surface2: string;
      ink: string;
      inkDim: string;
      rose: string;
      roseDeep: string;
      gold: string;
      sage: string;
      sageDeep: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#c15c71', // Rose
      light: '#d97d90',
      dark: '#9a3450',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d3a34c', // Gold
      light: '#e4be75',
      dark: '#b0812d',
      contrastText: '#241019',
    },
    terezinha: {
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
    background: {
      default: '#f8f4ec',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c0c15',
      secondary: '#4a3227',
    },
    success: {
      main: '#7fa176',
      light: '#9ab892',
      dark: '#4f6b4f',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c15c71',
      light: '#d97d90',
      dark: '#9a3450',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d3a34c',
      light: '#e4be75',
      dark: '#b0812d',
      contrastText: '#241019',
    },
    info: {
      main: '#8c5a6d',
      light: '#ab798c',
      dark: '#683a4c',
      contrastText: '#ffffff',
    },
    divider: 'rgba(211, 163, 76, 0.15)',
  },
  typography: {
    fontFamily: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h4: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    subtitle1: {
      fontFamily: '"Manrope", sans-serif',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Manrope", sans-serif',
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Manrope", sans-serif',
      lineHeight: 1.5,
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: '"Manrope", sans-serif',
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8f4ec',
          color: '#1c0c15',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          fontWeight: 700,
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
