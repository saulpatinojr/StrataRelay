import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import * as XLSX from 'xlsx';
import { parseRVToolsData, parseAzMigrateData, analyzeCloudReadiness } from '../services/dataParser';

const FileUploader = ({ onUpload, onDataParsed }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Parse Excel file locally first
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let parsedData;
      if (file.name.toLowerCase().includes('rvtools')) {
        parsedData = parseRVToolsData(workbook);
      } else if (file.name.toLowerCase().includes('migrate') || file.name.toLowerCase().includes('readiness')) {
        parsedData = parseAzMigrateData(workbook);
      } else {
        parsedData = parseRVToolsData(workbook); // Default to RVTools format
      }
      
      const assessment = analyzeCloudReadiness(parsedData);
      
      // Upload to Firebase
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      
      const jobDoc = await addDoc(collection(db, 'jobs'), {
        fileName: file.name,
        status: 'processed',
        createdAt: new Date(),
        filePath: storageRef.fullPath,
        assessmentData: assessment,
        parsedData: parsedData
      });

      onUpload(jobDoc.id);
      if (onDataParsed) {
        onDataParsed(assessment, parsedData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
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
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6">
        {isDragActive ? 'Drop Excel file here' : 'Drag & drop RVTools or Azure Migrate Excel file'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Supported: RVTools export, Cloud-Readiness-Assessment.xlsx
      </Typography>
    </Paper>
  );
};

export default FileUploader;