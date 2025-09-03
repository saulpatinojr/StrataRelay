import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Alert, CircularProgress, TextField, Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
// Firebase imports removed for local processing
import { parseExcelFile, analyzeCloudReadiness } from '../services/dataParser';
import { detectFileType, createUniversalDataStructure } from '../services/universalParser';
import { validateFileName } from '../utils/fileValidator';
import * as XLSX from 'xlsx';

const FileUploader = ({ onUpload, onDataParsed }) => {
  const [fileError, setFileError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [batchCode, setBatchCode] = useState('');

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
      
      // Store data and show code input
      setUploadedFile(file);
      setParsedData({ assessment, universalData });
    } catch (error) {
      console.error('Upload failed:', error);
      setFileError(`Processing failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleAddData = () => {
    if (!batchCode.trim() || batchCode.length !== 2) {
      setFileError('Please enter a valid 2-digit code');
      return;
    }

    const jobId = `local_${Date.now()}`;
    onUpload(jobId, null, uploadedFile.name);
    if (onDataParsed) {
      onDataParsed(parsedData.assessment, parsedData.universalData, null, uploadedFile.name);
    }
    
    // Reset state
    setUploadedFile(null);
    setParsedData(null);
    setBatchCode('');
  };

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
      {!uploadedFile ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.500',
            bgcolor: 'background.paper'
          }}
        >
          <input {...getInputProps()} />
          {processing ? (
            <CircularProgress size={24} sx={{ mb: 1 }} />
          ) : (
            <CloudUpload sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          )}
          <Typography variant="body1">
            {processing ? 'Processing...' : isDragActive ? 'Drop file here' : 'Select File'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            RVTools or Azure Migrate
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            File: {uploadedFile.name} ({parsedData?.assessment.totalVMs} VMs)
          </Typography>
          <TextField
            label="2-Digit Code"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value.slice(0, 2))}
            size="small"
            fullWidth
            sx={{ mb: 1.5 }}
            inputProps={{ maxLength: 2, pattern: '[0-9]{2}' }}
            helperText="Enter unique 2-digit code"
          />
          <Button
            variant="contained"
            onClick={handleAddData}
            disabled={!batchCode || batchCode.length !== 2}
            size="small"
            fullWidth
          >
            Add Data
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;