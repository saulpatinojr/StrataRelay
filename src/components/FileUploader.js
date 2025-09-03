import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
// Firebase imports removed for local processing
import { parseExcelFile, analyzeCloudReadiness } from '../services/dataParser';
import { detectFileType, createUniversalDataStructure } from '../services/universalParser';
import { validateFileName } from '../utils/fileValidator';
import * as XLSX from 'xlsx';

const FileUploader = ({ onUpload, onDataParsed }) => {
  const [fileError, setFileError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file name
    const validation = validateFileName(file.name);
    if (!validation.isValid) {
      setFileError(validation.error);
      return;
    }
    
    setFileError(null);
    setProcessing(true);

    try {
      // Parse Excel file with universal parser
      const arrayBuffer = await file.arrayBuffer();
      const workbook = await parseExcelFile(arrayBuffer);
      
      // Detect file type and create universal structure
      const fileType = detectFileType(workbook);
      const universalData = createUniversalDataStructure(workbook, fileType, file.name);
      
      // Create assessment from universal data
      const assessment = {
        totalVMs: universalData.vmCount,
        fileType: universalData.fileType,
        fileName: universalData.fileName
      };
      
      // Skip Firebase upload for now - process locally
      const jobId = `local_${Date.now()}`;
      
      onUpload(jobId, null, file.name);
      if (onDataParsed) {
        onDataParsed(assessment, universalData, null, file.name);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setFileError(`Processing failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }, [onUpload, onDataParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    }
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
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.500',
          bgcolor: 'background.paper'
        }}
      >
        <input {...getInputProps()} />
        {processing ? (
          <CircularProgress sx={{ mb: 2 }} />
        ) : (
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        )}
        <Typography variant="h6">
          {processing ? 'Processing file...' : isDragActive ? 'Drop files here' : 'Drag & drop data files'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Supported: RVTools export and Az Migrate Report
        </Typography>
      </Paper>
    </Box>
  );
};

export default FileUploader;