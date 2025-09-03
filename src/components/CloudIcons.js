import React from 'react';
import { Box } from '@mui/material';

const CloudIcons = () => {
  const icons = [
    { name: 'AWS', symbol: '☁️', color: '#FF9900', top: '10%', left: '5%', delay: '0s' },
    { name: 'Azure', symbol: '⚡', color: '#0078D4', top: '20%', left: '85%', delay: '5s' },
    { name: 'GCP', symbol: '🔧', color: '#4285F4', top: '70%', left: '10%', delay: '10s' },
    { name: 'OCI', symbol: '🌐', color: '#F80000', top: '80%', left: '90%', delay: '15s' },
    { name: 'AWS2', symbol: '☁️', color: '#FF9900', top: '50%', left: '95%', delay: '20s' },
    { name: 'Azure2', symbol: '⚡', color: '#0078D4', top: '90%', left: '20%', delay: '25s' },
    { name: 'GCP2', symbol: '🔧', color: '#4285F4', top: '30%', left: '70%', delay: '30s' },
    { name: 'OCI2', symbol: '🌐', color: '#F80000', top: '60%', left: '40%', delay: '35s' }
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      {icons.map((icon, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: icon.top,
            left: icon.left,
            fontSize: '48px',
            opacity: 0.08,
            color: icon.color,
            animation: `cloudDrift 20s ease-in-out infinite`,
            animationDelay: icon.delay,
            '@keyframes cloudDrift': {
              '0%': {
                transform: 'translateY(0px) translateX(0px) scale(1)',
              },
              '20%': {
                transform: 'translateY(-60px) translateX(80px) scale(1.2)',
              },
              '40%': {
                transform: 'translateY(-30px) translateX(-70px) scale(0.8)',
              },
              '60%': {
                transform: 'translateY(-80px) translateX(50px) scale(1.1)',
              },
              '80%': {
                transform: 'translateY(-20px) translateX(-40px) scale(0.9)',
              },
              '100%': {
                transform: 'translateY(0px) translateX(0px) scale(1)',
              },
            }
          }}
        >
          {icon.symbol}
        </Box>
      ))}
    </Box>
  );
};

export default CloudIcons;