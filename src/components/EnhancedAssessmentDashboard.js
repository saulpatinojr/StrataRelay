import React, { useState } from 'react';
import { 
  Grid, Paper, Typography, Box, Card, CardContent, Chip, Alert, 
  Button, Dialog, DialogTitle, DialogContent, IconButton, Accordion,
  AccordionSummary, AccordionDetails, List, ListItem, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TextField, InputAdornment, Popover, Checkbox,
  FormControlLabel
} from '@mui/material';
import { 
  Computer, Memory, Storage, Cloud, TrendingUp, Warning, 
  ExpandMore, Close, Visibility, Analytics, Search, GetApp,
  ViewColumn, VisibilityOff 
} from '@mui/icons-material';
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2';

const EnhancedAssessmentDashboard = ({ 
  assessmentData, 
  aiInsights, 
  parsedData, 
  openDialog, 
  setOpenDialog, 
  selectedMetric, 
  setSelectedMetric 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  if (!assessmentData) return null;

  const { compute, storage, licensing, cloudReadiness, recommendations } = assessmentData;

  const handleDrillDown = (metricType, data) => {
    setSelectedMetric({ type: metricType, data });
    setOpenDialog(true);
  };

  const MetricCard = ({ title, value, icon, color = 'primary', onClick, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      '&:hover': onClick ? { 
        transform: 'translateY(-4px)', 
        boxShadow: 6 
      } : {}
    }} onClick={onClick}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
        </Box>
        <Typography variant="h4" color={`${color}.main`} gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {onClick && (
          <Button size="small" startIcon={<Visibility />} sx={{ mt: 1 }}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const getVMSizeDistribution = () => {
    if (!parsedData?.vInfo) return null;
    
    const sizes = { small: 0, medium: 0, large: 0, xlarge: 0 };
    parsedData.vInfo.forEach(vm => {
      const cpu = vm.CPUs || 0;
      const memory = (vm.Memory || 0) / 1024;
      
      if (cpu <= 2 && memory <= 4) sizes.small++;
      else if (cpu <= 4 && memory <= 8) sizes.medium++;
      else if (cpu <= 8 && memory <= 16) sizes.large++;
      else sizes.xlarge++;
    });

    return {
      labels: ['Small (≤2 CPU, ≤4GB)', 'Medium (≤4 CPU, ≤8GB)', 'Large (≤8 CPU, ≤16GB)', 'XLarge (>8 CPU, >16GB)'],
      datasets: [{
        data: [sizes.small, sizes.medium, sizes.large, sizes.xlarge],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
      }]
    };
  };

  const getTopVMsByResource = () => {
    if (!parsedData?.vInfo) return [];
    
    return parsedData.vInfo
      .sort((a, b) => (b.CPUs || 0) - (a.CPUs || 0))
      .slice(0, 10)
      .map(vm => ({
        name: vm.VM || 'Unknown',
        cpu: vm.CPUs || 0,
        memory: Math.round((vm.Memory || 0) / 1024),
        powerState: vm.Powerstate || 'Unknown'
      }));
  };

  const getTableColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const getVisibleColumns = (data) => {
    const allColumns = getTableColumns(data);
    return allColumns.filter(col => !hiddenColumns.has(col));
  };

  const getFilteredData = (data, search) => {
    if (!search) return data;
    const visibleColumns = getVisibleColumns(data);
    return data.filter(row => 
      visibleColumns.some(col => 
        String(row[col]).toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const toggleColumn = (column) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(column)) {
      newHidden.delete(column);
    } else {
      newHidden.add(column);
    }
    setHiddenColumns(newHidden);
  };

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${formatCellValue(row[header])}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Enhanced Cloud Assessment Dashboard</Typography>
      
      {/* Key Metrics with Drill-down */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total VMs" 
            value={assessmentData.totalVMs}
            subtitle="Powered On & Off"
            icon={<Computer color="primary" />}
            onClick={() => handleDrillDown('vms', parsedData?.vInfo)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total vCPUs" 
            value={compute.totalCPU}
            subtitle={`Avg: ${(compute.totalCPU / assessmentData.totalVMs || 0).toFixed(1)} per VM`}
            icon={<Memory color="secondary" />}
            color="secondary"
            onClick={() => handleDrillDown('cpu', getTopVMsByResource())}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Memory (GB)" 
            value={Math.round(compute.totalMemoryGB)}
            subtitle={`Avg: ${(compute.totalMemoryGB / assessmentData.totalVMs || 0).toFixed(1)}GB per VM`}
            icon={<Memory color="info" />}
            color="info"
            onClick={() => handleDrillDown('memory', parsedData?.vMemory)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Storage (TB)" 
            value={Math.round(storage.totalStorageGB / 1024 * 10) / 10}
            subtitle={`${Math.round(storage.totalStorageGB)}GB Total`}
            icon={<Storage color="warning" />}
            color="warning"
            onClick={() => handleDrillDown('storage', parsedData?.vDisk)}
          />
        </Grid>
      </Grid>

      {/* Enhanced Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>VM Size Distribution</Typography>
            {getVMSizeDistribution() && (
              <Doughnut data={getVMSizeDistribution()} options={{ responsive: true }} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Cloud Readiness Breakdown</Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label={`${cloudReadiness.ready} Ready`} color="success" sx={{ mr: 1 }} />
              <Chip label={`${cloudReadiness.needsWork} Needs Work`} color="warning" sx={{ mr: 1 }} />
              <Chip label={`${cloudReadiness.complex} Complex`} color="error" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round((cloudReadiness.ready / assessmentData.totalVMs) * 100)}% of VMs are cloud-ready
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Insights */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
          Infrastructure Insights
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Top Resource Consumers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {getTopVMsByResource().slice(0, 5).map((vm, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={vm.name}
                    secondary={`${vm.cpu} vCPUs, ${vm.memory}GB RAM - ${vm.powerState}`}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Migration Recommendations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert severity={rec.type}>
                    <Typography variant="subtitle2">{rec.title}</Typography>
                    <Typography variant="body2">{rec.description}</Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Drill-down Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedMetric?.type.toUpperCase()} Details
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMetric?.data && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewColumn />}
                    onClick={(e) => setShowColumnSelector(e.currentTarget)}
                  >
                    Columns
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GetApp />}
                    onClick={() => {
                      const csv = convertToCSV(selectedMetric.data);
                      downloadCSV(csv, `${selectedMetric.type}_data.csv`);
                    }}
                  >
                    Export CSV
                  </Button>
                </Box>
              </Box>
              
              <TableContainer sx={{ maxHeight: 'calc(90vh - 200px)', width: '100%' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {getVisibleColumns(selectedMetric.data).map((col) => (
                        <TableCell 
                          key={col} 
                          sx={{ 
                            fontWeight: 'bold',
                            minWidth: 120,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleColumn(col)}
                          title={`Click to hide ${col}`}
                        >
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredData(selectedMetric.data, searchTerm)
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={index} hover>
                          {getVisibleColumns(selectedMetric.data).map((col) => (
                            <TableCell 
                              key={col}
                              sx={{
                                minWidth: 120,
                                maxWidth: 200,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={formatCellValue(row[col])}
                            >
                              {formatCellValue(row[col])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={getFilteredData(selectedMetric.data, searchTerm).length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Column Selector Popover */}
      <Popover
        open={Boolean(showColumnSelector)}
        anchorEl={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom>
            Show/Hide Columns
          </Typography>
          {selectedMetric?.data && getTableColumns(selectedMetric.data).map((col) => (
            <FormControlLabel
              key={col}
              control={
                <Checkbox
                  checked={!hiddenColumns.has(col)}
                  onChange={() => toggleColumn(col)}
                  size="small"
                  sx={{ color: 'primary.main' }}
                />
              }
              label={col}
              sx={{ display: 'block', mb: 0.5 }}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default EnhancedAssessmentDashboard;