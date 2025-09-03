import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import LandingPage from './components/LandingPage';
import AssessmentPage from './components/AssessmentPage';
import FloatingAI from './components/FloatingAI';
import useAssessmentStore from './store/assessmentStore';
import { getThemeByDataType } from './theme/dynamicTheme';

// --- Guru Grade Component ---
// App.js is now a clean router. All logic is in the store.
function App() {
  // Get state and actions from the central store
  const currentPage = useAssessmentStore(state => state.currentPage);
  const assessmentData = useAssessmentStore(state => state.assessmentData);
  const parsedData = useAssessmentStore(state => state.parsedData);

  // The theme can still be dynamic based on the data
  const currentTheme = getThemeByDataType(assessmentData);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      
      {currentPage === 'landing' ? (
        <>
          <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', color: '#fff' }}>
            <Toolbar sx={{ minHeight: '80px' }}>
              <Typography variant="h4" component="div" sx={{ 
                fontWeight: 700,
                letterSpacing: '1px',
              }}>
                StrataRelay
              </Typography>
            </Toolbar>
          </AppBar>
          <LandingPage />
        </>
      ) : (
        <AssessmentPage />
      )}
      
      {/* The FloatingAI now gets its data directly from the store as well */}
      {currentPage === 'assessment' && parsedData && (
        <FloatingAI assessmentData={parsedData} />
      )}
    </ThemeProvider>
  );
}

export default App;
