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

  const handleUpload = (jobId, sheetCode = '01', fileName = '') => {
    setCurrentJobId(jobId);
  };

  const handleDataParsed = async (assessment, universalData, sheetCode = '01', fileName = '') => {
    // Use VM count from universal data structure
    const vmCount = universalData.vmCount || 0;
    
    // Add to data sources
    const displayName = fileName ? fileName.replace(/\.[^/.]+$/, '') : `Data Sheet ${sheetCode}`;
    const newSource = {
      code: sheetCode,
      name: displayName,
      data: universalData,
      vmCount: vmCount
    };
    
    const updatedSources = [...dataSources, newSource];
    setDataSources(updatedSources);
    setActiveSheets([...activeSheets, sheetCode]);
    
    // Create combined assessment from all sources
    const anchors = createDataAnchors(updatedSources);
    const combinedAssessment = {
      ...assessment,
      totalVMs: anchors.size, // Total unique VMs across all sources
      dataSources: updatedSources.length,
      activeSheets: [...activeSheets, sheetCode]
    };
    
    setAssessmentData(combinedAssessment);
    setParsedData(universalData);
    setCurrentPage('assessment');
    
    // Get AI insights
    try {
      const insights = await analyzeCloudReadiness(universalData.vms || [], null);
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    }
  };

  const handleToggleSheet = (sheetCode) => {
    const newActiveSheets = activeSheets.includes(sheetCode) 
      ? activeSheets.filter(code => code !== sheetCode)
      : [...activeSheets, sheetCode];
    
    setActiveSheets(newActiveSheets);
    
    // Recalculate assessment with active sheets only
    const activeDataSources = dataSources.filter(ds => newActiveSheets.includes(ds.code));
    if (activeDataSources.length > 0) {
      const anchors = createDataAnchors(activeDataSources);
      const updatedAssessment = {
        ...assessmentData,
        totalVMs: anchors.size,
        activeSheets: newActiveSheets
      };
      setAssessmentData(updatedAssessment);
    }
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