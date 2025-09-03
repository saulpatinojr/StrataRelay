import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Chip, Alert } from '@mui/material';
import { Computer, Memory, Storage, Cloud, TrendingUp, Warning } from '@mui/icons-material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

const CloudAssessmentDashboard = ({ assessmentData, aiInsights }) => {
  if (!assessmentData) return null;

  const { compute, storage, licensing, cloudReadiness, recommendations } = assessmentData;

  const readinessData = {
    labels: ['Cloud Ready', 'Needs Work', 'Complex Migration'],
    datasets: [{
      data: [cloudReadiness.ready, cloudReadiness.needsWork, cloudReadiness.complex],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      borderWidth: 0
    }]
  };

  const licensingData = {
    labels: ['Windows', 'Linux', 'Other'],
    datasets: [{
      label: 'VM Count',
      data: [licensing.windowsVMs, licensing.linuxVMs, assessmentData.totalVMs - licensing.windowsVMs - licensing.linuxVMs],
      backgroundColor: ['#2196f3', '#4caf50', '#9e9e9e'],
      borderWidth: 1
    }]
  };

  const MetricCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
        </Box>
        <Typography variant="h4" color={`${color}.main`}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Cloud Assessment Dashboard</Typography>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total VMs" 
            value={assessmentData.totalVMs}
            icon={<Computer color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total CPUs" 
            value={compute.totalCPU}
            icon={<Memory color="secondary" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Memory (GB)" 
            value={Math.round(compute.totalMemoryGB)}
            icon={<Memory color="info" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Storage (TB)" 
            value={Math.round(storage.totalStorageGB / 1024 * 10) / 10}
            icon={<Storage color="warning" />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Cloud Readiness Assessment</Typography>
            <Doughnut data={readinessData} options={{ responsive: true }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Operating System Distribution</Typography>
            <Bar data={licensingData} options={{ responsive: true }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
          Migration Recommendations
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Alert severity={rec.type} sx={{ height: '100%' }}>
                <Typography variant="subtitle2">{rec.title}</Typography>
                <Typography variant="body2">{rec.description}</Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* AI Insights */}
      {aiInsights && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Cloud sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI-Powered Insights
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {aiInsights}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CloudAssessmentDashboard;