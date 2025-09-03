import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid, Box } from '@mui/material';
import FileUploader from './components/FileUploader';
import JobTimeline from './components/JobTimeline';
import CloudAssessmentDashboard from './components/CloudAssessmentDashboard';
import AIChat from './components/AIChat';
import TestDataInfo from './components/TestDataInfo';
import { analyzeCloudReadiness } from './services/geminiService';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    }
  }
});

function App() {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleUpload = (jobId) => {
    setCurrentJobId(jobId);
  };

  const handleDataParsed = async (assessment, rawData) => {
    setAssessmentData(assessment);
    setParsedData(rawData);
    
    // Get AI insights
    try {
      const insights = await analyzeCloudReadiness(rawData.vInfo || [], null);
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            StrataRelay Analytics
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="h5" gutterBottom>Upload Excel File</Typography>
              <TestDataInfo />
              <FileUploader onUpload={handleUpload} onDataParsed={handleDataParsed} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {currentJobId && (
              <JobTimeline jobId={currentJobId} />
            )}
          </Grid>
          
          {assessmentData && (
            <Grid item xs={12}>
              <CloudAssessmentDashboard 
                assessmentData={assessmentData} 
                aiInsights={aiInsights}
              />
            </Grid>
          )}
          
          {assessmentData && (
            <Grid item xs={12}>
              <AIChat assessmentData={parsedData} />
            </Grid>
          )}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;