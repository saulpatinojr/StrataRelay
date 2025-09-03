import React from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';

const TestDataInfo = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="info">
        <AlertTitle>Test Data Available</AlertTitle>
        <Typography variant="body2">
          Excel files are available in the parent directory for testing:
        </Typography>
        <ul>
          <li>RVTools_export-vCenter01df.xlsx</li>
          <li>RVTools_export-vCenter02df.xlsx</li>
        </ul>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Drag and drop these files to test the upload functionality.
        </Typography>
      </Alert>
    </Box>
  );
};

export default TestDataInfo;