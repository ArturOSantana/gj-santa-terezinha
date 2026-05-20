import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1f4d3a',
      light: '#356854',
      dark: '#16372a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8c6b2f',
      light: '#a48344',
      dark: '#654b1f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ece7dc',
      paper: '#f7f2e8',
    },
    text: {
      primary: '#1e1e1e',
      secondary: '#4d4d4d',
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
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          transition: 'none !important',
          animation: 'none !important',
          scrollBehavior: 'auto !important',
        },
        body: {
          backgroundColor: '#ece7dc',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '10px 18px',
          boxShadow: 'none',
          border: '1px solid transparent',
          transition: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          backgroundImage: 'none',
          border: '1px solid rgba(30, 30, 30, 0.14)',
          transition: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 0,
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

