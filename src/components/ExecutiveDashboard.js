import React from 'react';
import { Grid, Paper, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { TrendingUp, Security, Speed, Nature, AttachMoney } from '@mui/icons-material';

const ExecutiveDashboard = ({ metrics }) => {
  if (!metrics) return null;

  const formatCurrency = (amount) => `$${(amount / 1000).toFixed(0)}K`;
  const formatPercent = (value) => `${Math.round(value)}%`;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700, 
        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 3
      }}>
        Executive Summary
      </Typography>
      
      <Grid container spacing={3}>
        {/* Financial Impact */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '200px', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AttachMoney sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="h6">Financial Impact</Typography>
            </Box>
            <Typography variant="h3" color="success.main" gutterBottom>
              {formatCurrency(metrics.costOptimization.projectedSavings)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Annual Savings Potential
            </Typography>
            <Box mt="auto">
              <Typography variant="caption">
                Current Spend: {formatCurrency(metrics.costOptimization.currentSpend)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Cloud Readiness */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '200px', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Speed sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">Cloud Readiness</Typography>
            </Box>
            <Typography variant="h3" color="primary.main" gutterBottom>
              {metrics.readinessScore.overall}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={metrics.readinessScore.overall} 
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />
            <Box mt="auto">
              <Chip 
                label={metrics.readinessScore.overall > 80 ? 'Ready' : 'Needs Work'} 
                color={metrics.readinessScore.overall > 80 ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Security & Compliance */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '200px', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Security sx={{ color: 'error.main', mr: 1 }} />
              <Typography variant="h6">Security Risks</Typography>
            </Box>
            <Typography variant="h3" color="error.main" gutterBottom>
              {metrics.riskAnalysis.securityRisks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Critical Issues Found
            </Typography>
            <Box mt="auto">
              <Typography variant="caption">
                Compliance Score: {metrics.readinessScore.security}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Sustainability */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '200px', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Nature sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="h6">Sustainability</Typography>
            </Box>
            <Typography variant="h3" color="success.main" gutterBottom>
              {Math.round(metrics.sustainability.carbonFootprint)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tons CO₂ Reduction
            </Typography>
            <Box mt="auto">
              <Chip 
                label="Green Cloud Ready" 
                color="success"
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Migration Complexity Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Migration Complexity</Typography>
            <Grid container spacing={2}>
              {Object.entries(metrics.migrationComplexity).map(([level, count]) => (
                <Grid item xs={3} key={level}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={
                      level === 'simple' ? 'success.main' :
                      level === 'moderate' ? 'warning.main' :
                      level === 'complex' ? 'error.main' : 'error.dark'
                    }>
                      {count}
                    </Typography>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {level}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <Box>
              {[
                { label: 'CPU Utilization', value: metrics.performance.cpuUtilization.avg, unit: '%' },
                { label: 'Memory Usage', value: metrics.performance.memoryUtilization.avg, unit: '%' },
                { label: 'Storage IOPS', value: metrics.performance.storageIOPS.avg, unit: '' },
                { label: 'Network Throughput', value: metrics.performance.networkThroughput.avg, unit: 'Mbps' }
              ].map((metric, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{metric.label}</Typography>
                    <Typography variant="body2">
                      {Math.round(metric.value)}{metric.unit}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, metric.value)} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveDashboard;