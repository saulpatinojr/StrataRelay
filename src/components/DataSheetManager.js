import React, { useState } from 'react';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, Chip, 
  FormControlLabel, Checkbox, Typography, Divider
} from '@mui/material';
import { FilterList, Refresh } from '@mui/icons-material';
import FileUploader from './FileUploader';
import useAssessmentStore from '../store/assessmentStore';

const DataSheetManager = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    dataSources,
    activeSheets,
    toggleSheet,
    fetchAssessment,
    restart
  } = useAssessmentStore();

  const handleDataParsed = (assessment, universalData) => {
    fetchAssessment(assessment, universalData);
    setFilterOpen(false);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        onClick={() => setFilterOpen(true)}
      >
        Manage Data ({activeSheets.length}/{dataSources.length})
      </Button>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Data Sheets</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" sx={{ mb: 1 }}>Filter Data Sheets</Typography>
          {dataSources.map(source => (
            <FormControlLabel
              key={source.code}
              control={
                <Checkbox
                  checked={activeSheets.includes(source.code)}
                  onChange={() => toggleSheet(source.code)}
                />
              }
              label={`${source.name} (${source.vmCount} VMs)`}
            />
          ))}
          
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>Upload New Data</Typography>
          <FileUploader onDataParsed={handleDataParsed} />
          
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>Restart Assessment</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            This will clear all data and return to the landing page.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Refresh />}
            onClick={restart}
          >
            Restart
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DataSheetManager;
