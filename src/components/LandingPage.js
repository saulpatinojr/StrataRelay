import React from 'react';
import { Container, Grid, Box, Fade, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import FileUploader from './FileUploader';
import SimpleTimeline from './SimpleTimeline';
import AnimatedBackground from './AnimatedBackground';
import CloudIcons from './CloudIcons';

const LandingPage = ({ onUpload, onDataParsed, currentJobId, onRestart }) => {
  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <CloudIcons />
      
      <Container maxWidth="xl" sx={{ pt: 8, pb: 4 }}>
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
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={onRestart}
                  sx={{ mb: 4 }}
                >
                  Restart Assessment
                </Button>
                
                <FileUploader onUpload={onUpload} onDataParsed={onDataParsed} />
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
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;