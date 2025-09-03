import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { parseExcelFile, analyzeCloudReadiness } from '../services/dataParser';
import { detectFileType, createUniversalDataStructure } from '../services/universalParser';
import { validateFileName } from '../utils/fileValidator';

const FileUploader = ({ onDataParsed, disabled }) => {
  const [fileError, setFileError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = validateFileName(file.name);
    if (!validation.isValid) {
      setFileError(validation.error);
      return;
    }
    
    setFileError(null);
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = await parseExcelFile(arrayBuffer);
      
      const fileType = detectFileType(workbook);
      const universalData = createUniversalDataStructure(workbook, fileType, file.name);
      
      const assessment = analyzeCloudReadiness(universalData.vms);

      if (onDataParsed) {
        onDataParsed(assessment, universalData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setFileError(`Processing failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }, [onDataParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    disabled
  });

  return (
    <Box>
      {fileError && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {fileError}
        </Alert>
      )}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.500',
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <input {...getInputProps()} />
        {processing ? (
          <CircularProgress size={32} />
        ) : (
          <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
        )}
        <Typography variant="h6" sx={{ mt: 2 }}>
          {processing ? 'Processing...' : isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports RVTools (.xlsx) and Azure Migrate (.xlsx) files.
        </Typography>
      </Paper>
    </Box>
  );
};

export default FileUploader;
