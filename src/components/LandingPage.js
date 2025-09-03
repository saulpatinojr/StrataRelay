import React from 'react';
import { Container, Grid, Box, Fade, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import FileUploader from './FileUploader';
import AnimatedBackground from './AnimatedBackground';
import CloudIcons from './CloudIcons';
import useAssessmentStore from '../store/assessmentStore';

// --- Guru Grade Component ---
// LandingPage is now decoupled, getting its actions from the store.
const LandingPage = () => {
  // Get actions directly from the store
  const fetchAssessment = useAssessmentStore(state => state.fetchAssessment);
  const restart = useAssessmentStore(state => state.restart);
  const isLoading = useAssessmentStore(state => state.isLoading);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <CloudIcons />
      
      <Container maxWidth="lg" sx={{ pt: 8, pb: 4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={8} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Fade in timeout={800}>
              <Box sx={{ mt: { xs: 4, md: 12 }, textAlign: 'center' }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{
                  fontWeight: 700,
                  color: 'common.white'
                }}>
                  Cloud Intelligence, Distilled.
                </Typography>
                
                <Typography variant="h6" component="p" sx={{ mb: 6, maxWidth: '650px', mx: 'auto', color: 'grey.400' }}>
                  Transform your raw infrastructure data into a clear roadmap for cloud migration. 
                  Get AI-powered recommendations and cost estimates for AWS, Azure, and GCP.
                </Typography>
                
                <FileUploader onDataParsed={fetchAssessment} disabled={isLoading} />

                <Button
                  variant="text"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={restart}
                  sx={{ mt: 4, color: 'grey.500' }}
                >
                  Start Over
                </Button>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
