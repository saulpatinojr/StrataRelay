import React, { useState } from 'react';
import { Paper, TextField, Box, Typography, Alert, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess, Add } from '@mui/icons-material';
import FileUploader from './FileUploader';

const BatchUploader = ({ onUpload, onDataParsed, existingBatches, minimized = false }) => {
  const [batchCode, setBatchCode] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(!minimized);

  const handleBatchCodeChange = (e) => {
    const code = e.target.value.slice(0, 2).toUpperCase();
    setBatchCode(code);
    
    if (code && existingBatches.includes(code)) {
      setError(`Batch code "${code}" already exists. Please use a different code.`);
    } else {
      setError('');
    }
  };

  const handleFileUpload = (jobId) => {
    if (!batchCode) {
      setError('Please enter a 2-digit batch code before uploading.');
      return;
    }
    if (existingBatches.includes(batchCode)) {
      setError(`Batch code "${batchCode}" already exists. Please use a different code.`);
      return;
    }
    onUpload(jobId, batchCode);
  };

  const handleDataParsed = (assessment, rawData) => {
    onDataParsed(assessment, rawData, batchCode);
    setBatchCode('');
  };

  return (
    <Paper sx={{ p: minimized ? 2 : 3, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant={minimized ? "subtitle1" : "h6"} gutterBottom>
          <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
          {minimized ? 'Add More Files' : 'Upload Assessment Files'}
        </Typography>
        {minimized && (
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Batch Code (2 digits)"
            value={batchCode}
            onChange={handleBatchCodeChange}
            placeholder="e.g., 01, 02, 03"
            size="small"
            sx={{ mb: 2, minWidth: 200 }}
            inputProps={{ maxLength: 2 }}
            error={!!error}
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FileUploader 
            onUpload={handleFileUpload} 
            onDataParsed={handleDataParsed}
            disabled={!batchCode || !!error}
          />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default BatchUploader;