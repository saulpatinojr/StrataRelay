import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Grid, Box } from '@mui/material';
import FileUploader from './components/FileUploader';
import JobTimeline from './components/JobTimeline';
import AnalyticsChart from './components/AnalyticsChart';
import TestDataInfo from './components/TestDataInfo';

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
  const [analyticsData, setAnalyticsData] = useState(null);

  const handleUpload = (jobId) => {
    setCurrentJobId(jobId);
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
              <FileUploader onUpload={handleUpload} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {currentJobId && (
              <JobTimeline jobId={currentJobId} />
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Analytics Dashboard
            </Typography>
            <AnalyticsChart data={analyticsData} />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;