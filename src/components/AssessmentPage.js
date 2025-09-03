import React, { useState } from 'react';
import { Container, Grid, Box, Fade, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import EnhancedAssessmentDashboard from './EnhancedAssessmentDashboard';
import DataSummary from './DataSummary';
import DetailedDataView from './DetailedDataView';
import DataSheetManager from './DataSheetManager';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AssessmentPage = ({ 
  assessmentData, 
  parsedData, 
  aiInsights,
  dataSources,
  activeSheets,
  onBack, 
  onRestart,
  onUpload,
  onDataParsed,
  onToggleSheet
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: '80px' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ mr: 2, color: 'white' }}
          >
            Back to Upload
          </Button>
          
          <Typography variant="h4" component="div" sx={{ 
            flexGrow: 1,
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            StrataRelay Analytics
          </Typography>
          
          <Box display="flex" gap={2}>
            <DataSheetManager 
              dataSources={dataSources}
              activeSheets={activeSheets}
              onToggleSheet={onToggleSheet}
              onAddData={onUpload}
              onDataParsed={onDataParsed}
            />
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRestart}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Restart Assessment
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Fade in timeout={800}>
              <Box>
                <DataSummary 
                  parsedData={parsedData} 
                  onDrillDown={(sheetName, sheetData) => {
                    setSelectedMetric({ type: sheetName, data: sheetData });
                    setOpenDialog(true);
                  }}
                />
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12}>
            <Fade in timeout={1000}>
              <Box>
                <EnhancedAssessmentDashboard 
                  assessmentData={assessmentData} 
                  aiInsights={aiInsights}
                  parsedData={parsedData}
                  openDialog={openDialog}
                  setOpenDialog={setOpenDialog}
                  selectedMetric={selectedMetric}
                  setSelectedMetric={setSelectedMetric}
                />
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12}>
            <Fade in timeout={1200}>
              <Box>
                <DetailedDataView parsedData={parsedData} assessmentData={assessmentData} />
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AssessmentPage;