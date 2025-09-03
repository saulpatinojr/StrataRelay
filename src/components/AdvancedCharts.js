import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend 
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend
);

const AdvancedCharts = ({ metrics }) => {
  if (!metrics) return null;

  // Cost Optimization Chart
  const costData = {
    labels: ['Current Spend', 'Optimized Spend', 'Potential Savings'],
    datasets: [{
      label: 'Cost Analysis ($K)',
      data: [
        metrics.costOptimization.currentSpend / 1000,
        (metrics.costOptimization.currentSpend - metrics.costOptimization.projectedSavings) / 1000,
        metrics.costOptimization.projectedSavings / 1000
      ],
      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
      borderWidth: 0,
      borderRadius: 8
    }]
  };

  // Migration Complexity Pie Chart
  const complexityData = {
    labels: ['Simple', 'Moderate', 'Complex', 'Blockers'],
    datasets: [{
      data: [
        metrics.migrationComplexity.simple,
        metrics.migrationComplexity.moderate,
        metrics.migrationComplexity.complex,
        metrics.migrationComplexity.blockers
      ],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9c27b0'],
      borderWidth: 0
    }]
  };

  // Performance Trends
  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'CPU Utilization %',
        data: [25, 28, 32, Math.round(metrics.performance.cpuUtilization.avg)],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Memory Utilization %',
        data: [45, 48, 52, Math.round(metrics.performance.memoryUtilization.avg)],
        borderColor: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Cloud Readiness Radar
  const readinessData = {
    labels: ['Compute', 'Storage', 'Network', 'Security', 'Governance', 'Overall'],
    datasets: [{
      label: 'Readiness Score',
      data: [
        metrics.readinessScore.compute,
        metrics.readinessScore.storage,
        metrics.readinessScore.network,
        metrics.readinessScore.security,
        metrics.readinessScore.governance,
        metrics.readinessScore.overall
      ],
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: '#667eea',
      borderWidth: 2,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#667eea'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#ffffff', usePointStyle: true }
      }
    },
    scales: {
      x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#ffffff' } }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.2)' },
        grid: { color: 'rgba(255,255,255,0.2)' },
        pointLabels: { color: '#ffffff' },
        ticks: { color: '#ffffff', backdropColor: 'transparent' }
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Advanced Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cost Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Cost Optimization Analysis</Typography>
            <Box sx={{ height: '320px' }}>
              <Bar data={costData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Migration Complexity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Migration Complexity Distribution</Typography>
            <Box sx={{ height: '320px' }}>
              <Doughnut 
                data={complexityData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { position: 'right', labels: { color: '#ffffff' } }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        {/* Performance Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Performance Trends</Typography>
            <Box sx={{ height: '320px' }}>
              <Line data={performanceData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Cloud Readiness Radar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Cloud Readiness Score</Typography>
            <Box sx={{ height: '320px' }}>
              <Radar data={readinessData} options={radarOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedCharts;