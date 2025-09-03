import React from 'react';
import { Paper, Typography, Box, Chip, Grid } from '@mui/material';
import { DataObject, TableChart } from '@mui/icons-material';

const DataSummary = ({ parsedData, fileType }) => {
  if (!parsedData) return null;

  const sheets = Object.keys(parsedData);
  const totalDataPoints = Object.values(parsedData).reduce((total, sheet) => total + sheet.length, 0);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        <DataObject sx={{ mr: 1, verticalAlign: 'middle' }} />
        Data Processing Summary
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" mb={1}>
            <TableChart sx={{ mr: 1 }} />
            <Typography variant="body1">
              <strong>{sheets.length}</strong> sheets processed
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            <strong>{totalDataPoints.toLocaleString()}</strong> total data points
          </Typography>
        </Grid>
      </Grid>

      <Box mt={2}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Processed Sheets:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {sheets.map((sheet, index) => (
            <Chip 
              key={index}
              label={`${sheet} (${parsedData[sheet].length})`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default DataSummary;