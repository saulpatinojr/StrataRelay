import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import LandingPage from './components/LandingPage';
import AssessmentPage from './components/AssessmentPage';
import useAssessmentStore from './store/assessmentStore';
import { getThemeByDataType } from './theme/dynamicTheme';

// App.js is now a clean router. All logic is in the store.
function App() {
  // Get state and actions from the central store
  const currentPage = useAssessmentStore(state => state.currentPage);
  const assessmentData = useAssessmentStore(state => state.assessmentData);

  // The theme can still be dynamic based on the data
  const currentTheme = getThemeByDataType(assessmentData);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      
      {currentPage === 'landing' ? <LandingPage /> : <AssessmentPage />}
      
    </ThemeProvider>
  );
}

export default App;
