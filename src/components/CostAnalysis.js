import React from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';

// Transparently shows the user how we get our numbers.
const CostAnalysis = ({ analysis }) => {
  if (!analysis || !analysis.cost_estimates) return null;

  const { cost_estimates } = analysis;
  console.log('Cost estimates:', cost_estimates); // Debug log

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Cost Analysis</Typography>
      <Grid container spacing={3}>
        {Object.entries(cost_estimates).map(([provider, data]) => (
          <Grid item xs={12} md={4} key={provider}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                {provider}
              </Typography>
              <Typography variant="h4" sx={{ my: 2, color: 'primary.main', fontWeight: 'bold' }}>
                ${data.monthly_cost.toLocaleString()}
                <Typography variant="body1" component="span" sx={{ color: 'text.secondary' }}>/mo</Typography>
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                (${data.annual_cost.toLocaleString()}/yr)
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Sample Instance Mapping</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>On-Prem VM</TableCell>
                      <TableCell>Cloud Instance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.instance_mapping.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell>{m.vm_name}</TableCell>
                        <TableCell>{m.mapped_instance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CostAnalysis;
