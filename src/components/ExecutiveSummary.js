import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Chip } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MonetizationOn, Dns, CloudDone } from '@mui/icons-material';

// --- Guru Grade Component ---
// A high-impact summary for executives.
const MetricCard = ({ title, value, icon, color = 'text.primary' }) => (
  <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
    <Box display="flex" alignItems="center" mb={1}>
      {icon}
      <Typography variant="h6" component="h3" sx={{ ml: 1.5, fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: color, textAlign: 'center', mt: 2 }}>
      {value}
    </Typography>
  </Paper>
);

const ExecutiveSummary = ({ analysis }) => {
  if (!analysis) return null;

  const { summary, cloud_readiness, cost_estimates } = analysis;

  const readinessData = {
    labels: ['Ready for Cloud', 'Needs Review', 'Complex'],
    datasets: [{
      data: [cloud_readiness.ready, cloud_readiness.needsWork, cloud_readiness.complex],
      backgroundColor: ['#2e7d32', '#ed6c02', '#d32f2f'],
      borderColor: '#121212',
      borderWidth: 3,
    }],
  };

  const costData = {
    labels: Object.keys(cost_estimates),
    datasets: [{
      label: 'Projected Monthly Cost',
      data: Object.values(cost_estimates).map(c => c.monthly_cost),
      backgroundColor: ['#1976d2', '#d32f2f', '#2e7d32'],
    }],
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Executive Summary</Typography>
      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid item xs={12} sm={4}>
          <MetricCard title="Powered-On VMs" value={summary.powered_on_vms} icon={<Dns fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard title="Cloud Ready VMs" value={cloud_readiness.ready} icon={<CloudDone fontSize="large" />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard title="Est. AWS Monthly Cost" value={`$${cost_estimates.aws.monthly_cost.toLocaleString()}`} icon={<MonetizationOn fontSize="large" />} color="primary.main" />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Projected Cloud Costs</Typography>
            <Bar data={costData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Cloud Readiness</Typography>
            <Doughnut data={readinessData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveSummary;
