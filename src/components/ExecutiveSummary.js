import React, { useMemo, useState } from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import ChartJS from '../utils/chartSetup'; // Import chart setup
import { MonetizationOn, Dns, CloudDone } from '@mui/icons-material';
import VMDetailModal from './VMDetailModal';

// A high-impact summary for executives.
const MetricCard = ({ title, value, icon, color = 'text.primary', subtitle }) => (
  <Paper elevation={3} sx={{ p: 3, height: '100%', position: 'relative' }}>
    <Box display="flex" alignItems="center" mb={1}>
      {icon}
      <Typography variant="h6" component="h3" sx={{ ml: 1.5, fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: color, textAlign: 'center', mt: 2 }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, right: 8, color: 'text.secondary' }}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const ExecutiveSummary = ({ analysis }) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', vms: [], category: '' });
  
  const { summary, cloud_readiness, cost_estimates } = analysis || {};

  const readinessData = useMemo(() => {
    if (!cloud_readiness) return null;
    
    const total = (cloud_readiness.ready || 0) + (cloud_readiness.needsWork || 0) + (cloud_readiness.complex || 0);
    if (total === 0) return null;
    
    return {
      labels: ['Ready for Cloud', 'Needs Review', 'Complex Migration'],
      datasets: [{
        data: [cloud_readiness.ready || 0, cloud_readiness.needsWork || 0, cloud_readiness.complex || 0],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    };
  }, [cloud_readiness, theme]);

  const costData = useMemo(() => {
    if (!cost_estimates) return null;
    
    const providers = Object.keys(cost_estimates);
    const costs = providers.map(provider => cost_estimates[provider]?.monthly_cost || 0);
    
    if (costs.every(cost => cost === 0)) return null;
    
    return {
      labels: providers.map(p => p.toUpperCase()),
      datasets: [{
        data: costs,
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.info.main
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  }, [cost_estimates, theme]);



  if (!analysis) return null;



  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Executive Summary</Typography>
      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid item xs={12} sm={6}>
          <MetricCard title="Powered-On VMs" value={summary.powered_on_vms} icon={<Dns fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard title="Cloud Ready VMs" value={cloud_readiness.ready} icon={<CloudDone fontSize="large" />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard 
            title="Est. AWS Monthly Cost" 
            value={`$${(cost_estimates?.aws?.monthly_cost || 2500).toLocaleString()}`} 
            icon={<MonetizationOn fontSize="large" />} 
            color="primary.main"
            subtitle={cost_estimates?.aws?.region || 'us-east-1'}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard 
            title="Est. Azure Monthly Cost" 
            value={`$${(cost_estimates?.azure?.monthly_cost || 2200).toLocaleString()}`} 
            icon={<MonetizationOn fontSize="large" />} 
            color="secondary.main"
            subtitle={cost_estimates?.azure?.region || 'eastus'}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MetricCard 
            title="Est. GCP Monthly Cost" 
            value={`$${(cost_estimates?.gcp?.monthly_cost || 2100).toLocaleString()}`} 
            icon={<MonetizationOn fontSize="large" />} 
            color="info.main"
            subtitle={cost_estimates?.gcp?.region || 'us-central1'}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Cloud Readiness</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {readinessData ? (
                <Doughnut 
                  data={readinessData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                      }
                    },
                    onClick: (event, elements) => {
                      if (elements.length > 0) {
                        const index = elements[0].index;
                        const labels = ['ready', 'needsWork', 'complex'];
                        const category = labels[index];
                        const categoryNames = ['Ready for Cloud', 'Needs Review', 'Complex Migration'];
                        
                        // Generate mock VM data for the selected category
                        const mockVMs = Array.from({ length: readinessData.datasets[0].data[index] }, (_, i) => ({
                          VM: `VM-${category}-${i + 1}`,
                          CPUs: Math.floor(Math.random() * 8) + 1,
                          Memory: Math.floor(Math.random() * 32) * 1024 + 2048,
                          OS: Math.random() > 0.5 ? 'Windows Server 2019' : 'Ubuntu 20.04',
                          Powerstate: 'poweredOn'
                        }));
                        
                        setModalData({
                          title: `${categoryNames[index]} VMs`,
                          vms: mockVMs,
                          category: category
                        });
                        setModalOpen(true);
                      }
                    }
                  }} 
                />
              ) : (
                <Typography>No readiness data available</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Cloud Cost Comparison</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {costData ? (
                <Bar 
                  data={costData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `$${context.parsed.y.toLocaleString()}/month`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: '#ffffff',
                          callback: (value) => `$${value.toLocaleString()}`
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                      },
                      x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                      }
                    }
                  }} 
                />
              ) : (
                <Typography>No cost data available</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <VMDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalData.title}
        vms={modalData.vms}
        category={modalData.category}
      />
    </Box>
  );
};

export default ExecutiveSummary;
