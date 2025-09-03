import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import LandingPage from './components/LandingPage';
import AssessmentPage from './components/AssessmentPage';
import FloatingAI from './components/FloatingAI';
import { analyzeCloudReadiness } from './services/geminiService';
import { createDataAnchors, filterDataByActiveSheets } from './services/dataAnchor';
import { getThemeByDataType } from './theme/dynamicTheme';



function App() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [dataSources, setDataSources] = useState([]);
  const [activeSheets, setActiveSheets] = useState([]);

  const handleUpload = (jobId, sheetCode = '01') => {
    setCurrentJobId(jobId);
  };

  const handleDataParsed = async (assessment, rawData, sheetCode = '01') => {
    // Add to data sources
    const newSource = {
      code: sheetCode,
      name: `Data Sheet ${sheetCode}`,
      data: rawData,
      vmCount: rawData.vInfo ? rawData.vInfo.length : 0
    };
    
    const updatedSources = [...dataSources, newSource];
    setDataSources(updatedSources);
    setActiveSheets([...activeSheets, sheetCode]);
    
    setAssessmentData(assessment);
    setParsedData(rawData);
    setCurrentPage('assessment');
    
    // Get AI insights
    try {
      const insights = await analyzeCloudReadiness(rawData.vInfo || [], null);
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    }
  };

  const handleToggleSheet = (sheetCode) => {
    setActiveSheets(prev => 
      prev.includes(sheetCode) 
        ? prev.filter(code => code !== sheetCode)
        : [...prev, sheetCode]
    );
  };

  const handleRestart = () => {
    setCurrentJobId(null);
    setAssessmentData(null);
    setAiInsights(null);
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
            onUpload={handleUpload}
            onDataParsed={handleDataParsed}
            currentJobId={currentJobId}
            onRestart={handleRestart}
          />
        </>
      )}
      
      {currentPage === 'assessment' && (
        <AssessmentPage 
          assessmentData={assessmentData}
          parsedData={parsedData}
          aiInsights={aiInsights}
          dataSources={dataSources}
          activeSheets={activeSheets}
          onBack={handleBackToLanding}
          onRestart={handleRestart}
          onUpload={handleUpload}
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