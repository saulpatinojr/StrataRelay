import React, { useState } from 'react';
import { Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { REGIONS, getRegionByValue } from '../utils/regionMapping';

const PricingOptions = ({ onOptionsChange }) => {
  const [region, setRegion] = useState('us-east-1');
  const [os, setOs] = useState('linux');

  const handleUpdate = () => {
    const selectedRegion = getRegionByValue(region);
    onOptionsChange({
      region: selectedRegion,
      os: os
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Pricing Options</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Region</InputLabel>
            <Select value={region} onChange={(e) => setRegion(e.target.value)} label="Region">
              {REGIONS.map(r => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Operating System</InputLabel>
            <Select value={os} onChange={(e) => setOs(e.target.value)} label="Operating System">
              <MenuItem value="linux">Linux</MenuItem>
              <MenuItem value="windows">Windows</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" onClick={handleUpdate} startIcon={<Refresh />} fullWidth>
            Update Pricing
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PricingOptions;