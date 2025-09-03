import React, { useState } from 'react';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, Chip, 
  FormControlLabel, Checkbox, Typography, Alert, TextField,
  IconButton, Collapse, Divider
} from '@mui/material';
import { FilterList, Upload, Refresh } from '@mui/icons-material';
import FileUploader from './FileUploader';

const DataSheetManager = ({ 
  dataSources, 
  activeSheets, 
  onToggleSheet, 
  onAddData,
  onDataParsed,
  onRestart
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newSheetCode, setNewSheetCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeChange = (e) => {
    const code = e.target.value.slice(0, 2).toUpperCase();
    setNewSheetCode(code);
    
    if (code && dataSources.some(ds => ds.code === code)) {
      setError(`Code "${code}" already exists. Use a different 2-digit code.`);
    } else {
      setError('');
    }
  };

  const handleUpload = (jobId, _, fileName) => {
    if (!newSheetCode || error) return;
    onAddData(jobId, newSheetCode, fileName);
  };

  const handleDataParsed = (assessment, rawData, _, fileName) => {
    onDataParsed(assessment, rawData, newSheetCode, fileName);
    setNewSheetCode('');
    setUploadOpen(false);
  };

  return (
    <Box display="flex" gap={2} mb={3}>
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        onClick={() => setFilterOpen(true)}
      >
        Manage Data ({activeSheets.length}/{dataSources.length})
      </Button>

      {/* Manage Data Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm">
        <DialogTitle>Manage Data Sheets</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Filter Data Sheets</Typography>
          
          {dataSources.map(source => (
            <FormControlLabel
              key={source.code}
              control={
                <Checkbox
                  checked={activeSheets.includes(source.code)}
                  onChange={() => onToggleSheet(source.code)}
                  size="small"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={source.code} size="small" />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {source.name} ({source.vmCount} VMs)
                  </Typography>
                </Box>
              }
              sx={{ display: 'block', mb: 0.5 }}
            />
          ))}
          
          <Divider sx={{ my: 1.5 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Upload Data</Typography>
          <FileUploader 
            onUpload={handleUpload}
            onDataParsed={handleDataParsed}
            onCodeRequired={(fileName) => {
              // Show code input after file is selected
            }}
          />
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Restart Assessment</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
              Clear all data and return to landing page
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
              onClick={onRestart}
              size="small"
            >
              Restart
            </Button>
          </Box>
        </DialogContent>
      </Dialog>


    </Box>
  );
};

export default DataSheetManager;