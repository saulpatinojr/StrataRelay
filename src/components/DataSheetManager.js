import React, { useState } from 'react';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, Chip, 
  FormControlLabel, Checkbox, Typography, Alert, TextField,
  IconButton, Collapse
} from '@mui/material';
import { FilterList, Add, ExpandMore, ExpandLess, Upload } from '@mui/icons-material';
import FileUploader from './FileUploader';

const DataSheetManager = ({ 
  dataSources, 
  activeSheets, 
  onToggleSheet, 
  onAddData,
  onDataParsed 
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
        Filter Sheets ({activeSheets.length}/{dataSources.length})
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={() => setUploadOpen(true)}
      >
        Add Data
      </Button>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Data Sheets</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Toggle data sheets on/off by their 2-digit codes:
          </Typography>
          
          {dataSources.map(source => (
            <Box key={source.code} sx={{ mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeSheets.includes(source.code)}
                    onChange={() => onToggleSheet(source.code)}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label={source.code} size="small" />
                    <Typography variant="body2">
                      {source.name} ({source.vmCount} VMs)
                    </Typography>
                  </Box>
                }
              />
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Data Sheet</DialogTitle>
        <DialogContent>
          <TextField
            label="2-Digit Code"
            value={newSheetCode}
            onChange={handleCodeChange}
            placeholder="e.g., 03, 04, 05"
            size="small"
            sx={{ mb: 2, minWidth: 200 }}
            inputProps={{ maxLength: 2 }}
            error={!!error}
            helperText={error}
          />
          
          {newSheetCode && !error && (
            <FileUploader 
              onUpload={handleUpload}
              onDataParsed={handleDataParsed}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DataSheetManager;