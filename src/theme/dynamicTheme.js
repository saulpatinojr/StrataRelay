import { createTheme } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    secondary: { main: '#ec4899' },
    background: {
      default: '#0f0f23',
      paper: 'rgba(30, 30, 46, 0.9)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3'
    }
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    h1: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
    },
    h4: { fontFamily: '"Rajdhani", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Rajdhani", sans-serif', fontWeight: 500 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 30, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          color: '#ffffff',
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        },
        head: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#ffffff',
          fontWeight: 600
        }
      }
    }
  }
});

export const getThemeByDataType = () => {

  return defaultTheme;
};