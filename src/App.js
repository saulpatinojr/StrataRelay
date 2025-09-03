import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid, Box, Fade } from '@mui/material';
import FileUploader from './components/FileUploader';
import SimpleTimeline from './components/SimpleTimeline';
import CloudAssessmentDashboard from './components/CloudAssessmentDashboard';
import AIChat from './components/AIChat';
import DataSummary from './components/DataSummary';
import TestDataInfo from './components/TestDataInfo';
import { analyzeCloudReadiness } from './services/geminiService';
import { getThemeByDataType } from './theme/dynamicTheme';
import AnimatedBackground from './components/AnimatedBackground';
import CloudIcons from './components/CloudIcons';



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

  const currentTheme = getThemeByDataType(assessmentData);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AnimatedBackground />
      <CloudIcons />
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
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={8} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Fade in timeout={800}>
              <Box mb={6} mt={18} textAlign="center">
                <Typography variant="h4" gutterBottom sx={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Cloud Migration Assessment</Typography>
                <Typography variant="body1" sx={{ mb: 40, mt: 10, maxWidth: '600px', mx: 'auto', color: 'text.secondary' }}>
                  Transform your infrastructure data into actionable cloud migration insights. 
                  Get AI-powered recommendations, cost estimates, and readiness assessments 
                  for AWS, Azure, GCP, and OCI migrations.
                </Typography>
                <FileUploader onUpload={handleUpload} onDataParsed={handleDataParsed} />
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {currentJobId && (
              <Fade in timeout={1000}>
                <Box>
                  <SimpleTimeline jobId={currentJobId} />
                </Box>
              </Fade>
            )}
          </Grid>
          
          {assessmentData && (
            <Grid item xs={12}>
              <Fade in timeout={1200}>
                <Box>
                  <DataSummary parsedData={parsedData} />
                  <CloudAssessmentDashboard 
                    assessmentData={assessmentData} 
                    aiInsights={aiInsights}
                  />
                </Box>
              </Fade>
            </Grid>
          )}
          
          {assessmentData && (
            <Grid item xs={12}>
              <Fade in timeout={1400}>
                <Box>
                  <AIChat assessmentData={parsedData} />
                </Box>
              </Fade>
            </Grid>
          )}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;