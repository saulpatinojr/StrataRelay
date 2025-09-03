import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import LandingPage from './components/LandingPage';
import AssessmentPage from './components/AssessmentPage';
import FloatingAI from './components/FloatingAI';
import { getAssessment } from './services/assessmentService';
import { getThemeByDataType } from './theme/dynamicTheme';

function App() {
  const [assessmentData, setAssessmentData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [dataSources, setDataSources] = useState([]);
  const [activeSheets, setActiveSheets] = useState([]);

  const handleDataParsed = async (universalData, fileName = '') => {
    try {
      // 1. Get the full assessment from the new backend endpoint
      const backendAssessment = await getAssessment(universalData);

      // 2. Add to data sources for the UI
      const displayName = fileName ? fileName.replace(/\.[^/.]+$/, '') : `Data Sheet`;
      const newSource = {
        code: fileName || 'new_data',
        name: displayName,
        data: universalData,
        vmCount: universalData.vmCount || 0
      };
      const updatedSources = [...dataSources, newSource];
      setDataSources(updatedSources);
      setActiveSheets([...activeSheets, newSource.code]);

      // 3. Set the state with the rich data from the backend
      setAssessmentData(backendAssessment);
      setParsedData(universalData); // Keep the original parsed data for detailed views
      setCurrentPage('assessment');

    } catch (error) {
      console.error('Failed to get assessment from backend:', error);
      // Optionally, set an error state to display to the user
    }
  };

  const handleToggleSheet = (sheetCode) => {
    const newActiveSheets = activeSheets.includes(sheetCode) 
      ? activeSheets.filter(code => code !== sheetCode)
      : [...activeSheets, sheetCode];
    
    setActiveSheets(newActiveSheets);
    
    // In the future, we could re-run the assessment with only active sheets.
    // For now, this just toggles the UI.
  };

  const handleRestart = () => {
    setAssessmentData(null);
    setParsedData(null);
    setDataSources([]);
    setActiveSheets([]);
    setCurrentPage('landing');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const currentTheme = getThemeByDataType(assessmentData);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      
      {currentPage === 'landing' && (
        <>
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ minHeight: '80px' }}>
              <Typography variant="h4" component="div" sx={{ 
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                StrataRelay Analytics
              </Typography>
            </Toolbar>
          </AppBar>
          
          <LandingPage 
            onDataParsed={handleDataParsed}
            onRestart={handleRestart}
          />
        </>
      )}
      
      {currentPage === 'assessment' && (
        <AssessmentPage 
          assessmentData={assessmentData}
          parsedData={parsedData}
          dataSources={dataSources}
          activeSheets={activeSheets}
          onBack={handleBackToLanding}
          onRestart={handleRestart}
          onDataParsed={handleDataParsed}
          onToggleSheet={handleToggleSheet}
        />
      )}
      
      {currentPage === 'assessment' && parsedData && (
        <FloatingAI assessmentData={parsedData} />
      )}
    </ThemeProvider>
  );
}

export default App;
