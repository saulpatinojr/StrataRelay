import React from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
          `,
          animation: 'float 6s ease-in-out infinite',
        },
        '&::after': {
          content: '"☁" "⚡" "🔧" "🌐"',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          fontSize: '60px',
          opacity: 0.1,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          animation: 'cloudFloat 12s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        '@keyframes cloudFloat': {
          '0%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '25%': {
            transform: 'translateY(-30px) translateX(20px)',
          },
          '50%': {
            transform: 'translateY(-10px) translateX(-15px)',
          },
          '75%': {
            transform: 'translateY(-25px) translateX(10px)',
          },
          '100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
        },
      }}
    />
  );
};

export default AnimatedBackground;