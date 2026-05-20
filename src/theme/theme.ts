import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2f5d50',
      light: '#4f7d70',
      dark: '#1f4036',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b88a44',
      light: '#cda567',
      dark: '#8d6930',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f4ef',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2933',
      secondary: '#5b6572',
    },
  },
  typography: {
    fontFamily: '"Inter", "-apple-system", BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      lineHeight: 1.6,
    },
    body1: {
      lineHeight: 1.65,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f7f4ef',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '9px 18px',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 10px 30px rgba(31, 41, 51, 0.06)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 18,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
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

