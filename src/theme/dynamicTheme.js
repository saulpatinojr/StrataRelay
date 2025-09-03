import { createTheme } from '@mui/material/styles';

export const getThemeByDataType = (assessmentData) => {
  let primaryColor = '#6366f1';
  let secondaryColor = '#ec4899';
  let backgroundGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  if (assessmentData) {
    const { cloudReadiness, licensing } = assessmentData;
    
    if (cloudReadiness.ready > cloudReadiness.complex) {
      primaryColor = '#10b981';
      secondaryColor = '#06b6d4';
      backgroundGradient = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    } else if (cloudReadiness.complex > cloudReadiness.ready) {
      primaryColor = '#f59e0b';
      secondaryColor = '#ef4444';
      backgroundGradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    }

    if (licensing.windowsVMs > licensing.linuxVMs) {
      secondaryColor = '#0078d4';
    }
  }

  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: primaryColor },
      secondary: { main: secondaryColor },
      background: {
        default: '#0f0f23',
        paper: 'rgba(30, 30, 46, 0.8)',
      }
    },
    typography: {
      fontFamily: '"Inter", "Poppins", sans-serif',
      h1: {
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 700,
        background: backgroundGradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      h4: { fontFamily: '"Rajdhani", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Rajdhani", sans-serif', fontWeight: 500 }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: 'rgba(30, 30, 46, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'rgba(30, 30, 46, 0.6)',
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: backgroundGradient,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            }
          }
        }
      }
    }
  });
};