import React from 'react';
import { Container, Grid, Box, Fade, AppBar, Toolbar, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import useAssessmentStore from '../store/assessmentStore';
import DataSheetManager from './DataSheetManager';
import ExecutiveSummary from './ExecutiveSummary';
import CostAnalysis from './CostAnalysis';
import RecommendationsPanel from './RecommendationsPanel';

// --- Guru Grade Component ---
// A clean, high-level page that orchestrates the new, focused components.
const AssessmentPage = () => {
  // Get all state and actions from the central store
  const {
    assessmentData,
    dataSources,
    activeSheets,
    backToLanding,
    restart,
    fetchAssessment,
    toggleSheet,
    isLoading,
    error
  } = useAssessmentStore(state => state);

  const renderContent = () => {
    if (isLoading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!assessmentData) {
      return <Typography sx={{ textAlign: 'center', mt: 10 }}>No assessment data available. Please start a new assessment.</Typography>;
    }

    return (
      <Fade in timeout={600}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <ExecutiveSummary analysis={assessmentData} />
          </Grid>
          <Grid item xs={12}>
            <CostAnalysis analysis={assessmentData} />
          </Grid>
          <Grid item xs={12}>
            <RecommendationsPanel analysis={assessmentData} />
          </Grid>
        </Grid>
      </Fade>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ minHeight: '80px' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={backToLanding}
            sx={{ mr: 2, color: 'white' }}
          >
            Back
          </Button>
          
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Cloud Assessment Results
          </Typography>
          
          <DataSheetManager 
            dataSources={dataSources}
            activeSheets={activeSheets}
            onToggleSheet={toggleSheet}
            onDataParsed={fetchAssessment}
            onRestart={restart}
          />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default AssessmentPage;
