import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D6A4F', // Rich Emerald Pine
      dark: '#1B4332',
      light: '#40916C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#081C15', // Deep Woodland Obsidian
      dark: '#040F0B',
      light: '#1B382B',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F39C12',
      light: '#FDEBD0',
    },
    error: {
      main: '#E63946',
      light: '#FCEBEB',
    },
    success: {
      main: '#2D6A4F',
      light: '#E8F5E9',
    },
    info: {
      main: '#2B6CB0',
      light: '#EBF8FF',
    },
    background: {
      default: '#F8FAF7', // Soft alpine mist
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0D2118',
      secondary: '#496053',
    },
    divider: '#E4EDE6',
  },
  typography: {
    fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0px 2px 6px rgba(8, 28, 21, 0.04)',
    '0px 4px 12px rgba(8, 28, 21, 0.06)',
    '0px 6px 18px rgba(8, 28, 21, 0.08)',
    '0px 10px 24px rgba(8, 28, 21, 0.09)',
    '0px 14px 32px rgba(8, 28, 21, 0.11)',
    '0px 18px 40px rgba(8, 28, 21, 0.13)',
    '0px 22px 48px rgba(8, 28, 21, 0.14)',
    '0px 26px 56px rgba(8, 28, 21, 0.15)',
    ...Array(16).fill('0px 26px 56px rgba(8, 28, 21, 0.15)'),
  ],
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 22px',
          fontWeight: 600,
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 6px 18px rgba(45, 106, 79, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #387F60 0%, #204F3B 100%)',
          },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(45, 106, 79, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4EDE6',
          boxShadow: '0px 4px 18px rgba(8, 28, 21, 0.04)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
          '&:hover': {
            borderColor: '#C5DBCB',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(8, 28, 21, 0.04)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 10,
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#081C15',
          boxShadow: '0px 1px 12px rgba(8, 28, 21, 0.04)',
          borderBottom: '1px solid #E4EDE6',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D7E3DA',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2D6A4F',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2D6A4F',
            borderWidth: 2,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 20px 60px rgba(8, 28, 21, 0.16)',
          border: '1px solid #E4EDE6',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: '#2D6A4F',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.92rem',
          textTransform: 'none',
          minHeight: 48,
          color: '#496053',
          '&.Mui-selected': {
            color: '#2D6A4F',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#081C15',
          borderRadius: 8,
          fontSize: '0.78rem',
          padding: '6px 12px',
        },
      },
    },
  },
});

export default theme;
