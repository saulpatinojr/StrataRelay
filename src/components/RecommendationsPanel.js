import React from 'react';
import { Paper, Typography, Box, Grid, Alert, AlertTitle } from '@mui/material';

// --- Guru Grade Component ---
// Turns analysis into actionable advice.
const RecommendationsPanel = ({ analysis }) => {
  if (!analysis || !analysis.recommendations || analysis.recommendations.length === 0) {
    return null;
  }

  const { recommendations } = analysis;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Actionable Recommendations</Typography>
      <Grid container spacing={3}>
        {recommendations.map((rec, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Alert severity={rec.type} sx={{ height: '100%' }}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>{rec.title}</AlertTitle>
              {rec.description}
            </Alert>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendationsPanel;
