import React, { useState, useMemo } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Checkbox, FormControlLabel, Grid
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';

const VMDetailModal = ({ open, onClose, title, vms, category }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('VM');
  const [hiddenColumns, setHiddenColumns] = useState(new Set());

  const columns = ['VM', 'CPUs', 'Memory', 'OS', 'Powerstate'];
  const visibleColumns = columns.filter(col => !hiddenColumns.has(col));

  const filteredVMs = useMemo(() => {
    return vms.filter(vm => 
      Object.values(vm).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return String(aVal).localeCompare(String(bVal));
    });
  }, [vms, searchTerm, sortBy]);

  const toggleColumn = (column) => {
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(column)) {
      newHidden.delete(column);
    } else {
      newHidden.add(column);
    }
    setHiddenColumns(newHidden);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'ready': return 'success';
      case 'needsWork': return 'warning';
      case 'complex': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Chip 
            label={`${filteredVMs.length} VMs`} 
            color={getCategoryColor(category)} 
            size="small" 
            sx={{ mt: 1 }}
          />
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search VMs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                {columns.map(col => (
                  <MenuItem key={col} value={col}>{col}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="body2" sx={{ mb: 1 }}>Column Visibility:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {columns.map(col => (
                <Button
                  key={col}
                  size="small"
                  variant={hiddenColumns.has(col) ? 'outlined' : 'contained'}
                  startIcon={hiddenColumns.has(col) ? <VisibilityOff /> : <Visibility />}
                  onClick={() => toggleColumn(col)}
                  sx={{ minWidth: 'auto' }}
                >
                  {col}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {visibleColumns.map(column => (
                  <TableCell key={column} sx={{ fontWeight: 'bold' }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVMs.map((vm, index) => (
                <TableRow key={index} hover>
                  {visibleColumns.map(column => (
                    <TableCell key={column}>
                      {column === 'Memory' ? `${Math.round(vm[column] / 1024)} GB` : vm[column]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default VMDetailModal;