import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Box, Chip, Alert, Button, 
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Psychology, ExpandMore, TrendingUp, Warning, 
  CheckCircle, Error, Lightbulb, Timeline
} from '@mui/icons-material';

const AIInsightsPanel = ({ metrics, dataSources }) => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (metrics) {
      generateAIInsights();
      generateRecommendations();
    }
  }, [metrics]);

  const generateAIInsights = () => {
    const newInsights = [];

    // Cost Optimization Insights
    if (metrics.costOptimization.projectedSavings > 100000) {
      newInsights.push({
        type: 'success',
        category: 'Cost Optimization',
        title: 'Significant Savings Opportunity',
        description: `AI analysis identifies $${Math.round(metrics.costOptimization.projectedSavings/1000)}K annual savings through right-sizing and reserved instances.`,
        confidence: 92,
        impact: 'High'
      });
    }

    // Performance Insights
    if (metrics.performance.cpuUtilization.avg < 30) {
      newInsights.push({
        type: 'warning',
        category: 'Performance',
        title: 'Over-Provisioned Resources',
        description: 'Low CPU utilization detected across infrastructure. Consider downsizing for cost efficiency.',
        confidence: 87,
        impact: 'Medium'
      });
    }

    // Security Insights
    if (metrics.riskAnalysis.securityRisks.length > 0) {
      newInsights.push({
        type: 'error',
        category: 'Security',
        title: 'Critical Security Risks',
        description: `${metrics.riskAnalysis.securityRisks.length} end-of-life systems require immediate attention.`,
        confidence: 95,
        impact: 'Critical'
      });
    }

    // Migration Complexity
    const complexRatio = metrics.migrationComplexity.complex / 
      (metrics.migrationComplexity.simple + metrics.migrationComplexity.moderate + metrics.migrationComplexity.complex);
    
    if (complexRatio > 0.3) {
      newInsights.push({
        type: 'warning',
        category: 'Migration',
        title: 'High Migration Complexity',
        description: 'Significant portion of workloads require complex migration strategies. Plan for extended timeline.',
        confidence: 89,
        impact: 'High'
      });
    }

    setInsights(newInsights);
  };

  const generateRecommendations = () => {
    const newRecommendations = [];

    // Financial Recommendations
    newRecommendations.push({
      priority: 1,
      category: 'Financial',
      action: 'Implement Reserved Instances',
      description: 'Purchase 1-year reserved instances for stable workloads',
      savings: metrics.costOptimization.reservedInstanceSavings || 50000,
      timeline: '30 days'
    });

    // Technical Recommendations
    if (metrics.performance.cpuUtilization.avg < 40) {
      newRecommendations.push({
        priority: 2,
        category: 'Technical',
        action: 'Right-size Compute Resources',
        description: 'Reduce VM sizes based on actual utilization patterns',
        savings: metrics.costOptimization.rightsizingOpportunities || 75000,
        timeline: '60 days'
      });
    }

    // Security Recommendations
    if (metrics.riskAnalysis.securityRisks.length > 0) {
      newRecommendations.push({
        priority: 1,
        category: 'Security',
        action: 'Upgrade End-of-Life Systems',
        description: 'Modernize legacy operating systems before migration',
        savings: 0,
        timeline: '90 days'
      });
    }

    setRecommendations(newRecommendations);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Lightbulb color="primary" />;
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 1 ? 'error' : priority === 2 ? 'warning' : 'info';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 600
      }}>
        <Psychology sx={{ mr: 1, color: 'primary.main' }} />
        AI-Powered Insights
      </Typography>

      {/* Key Insights */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Key Insights</Typography>
        {insights.map((insight, index) => (
          <Alert 
            key={index}
            severity={insight.type}
            icon={getInsightIcon(insight.type)}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {insight.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {insight.description}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip 
                  label={`${insight.confidence}% Confidence`} 
                  size="small" 
                  variant="outlined"
                />
                <Chip 
                  label={`${insight.impact} Impact`} 
                  size="small" 
                  color={insight.impact === 'Critical' ? 'error' : 
                         insight.impact === 'High' ? 'warning' : 'info'}
                />
              </Box>
            </Box>
          </Alert>
        ))}
      </Paper>

      {/* AI Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>AI Recommendations</Typography>
        {recommendations.map((rec, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" width="100%">
                <Chip 
                  label={`Priority ${rec.priority}`}
                  color={getPriorityColor(rec.priority)}
                  size="small"
                  sx={{ mr: 2 }}
                />
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  {rec.action}
                </Typography>
                {rec.savings > 0 && (
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    ${Math.round(rec.savings/1000)}K Savings
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {rec.description}
                </Typography>
                <Box display="flex" gap={2}>
                  <Chip 
                    label={`Timeline: ${rec.timeline}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    label={rec.category}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default AIInsightsPanel;