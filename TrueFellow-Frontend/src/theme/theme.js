import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A7A37', // Emerald/Leaf Green
      dark: '#355928',
      light: '#6E9C5B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0B2518', // Deep Forest Green
      dark: '#05120B',
      light: '#1B3F2D',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F5A623', // Amber Gold
    },
    background: {
      default: '#F7F9F6', // Light grayish-green background tint
      paper: '#ffffff',
    },
    text: {
      primary: '#1A2E22',
      secondary: '#556B5C',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      color: '#0B2518',
    },
    h2: {
      fontWeight: 700,
      color: '#0B2518',
    },
    h3: {
      fontWeight: 700,
      color: '#0B2518',
    },
    h4: {
      fontWeight: 700,
      color: '#0B2518',
    },
    h5: {
      fontWeight: 600,
      color: '#0B2518',
    },
    h6: {
      fontWeight: 600,
      color: '#0B2518',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 22px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(74, 122, 55, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 6px 18px rgba(11, 37, 24, 0.04)',
          border: '1px solid #E2EBE5',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0B2518',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.03)',
          borderBottom: '1px solid #E2EBE5',
        },
      },
    },
  },
});

export default theme;
