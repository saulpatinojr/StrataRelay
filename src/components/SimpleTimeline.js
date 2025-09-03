import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { CheckCircle, Schedule, Error, CloudUpload } from '@mui/icons-material';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const SimpleTimeline = ({ jobId }) => {
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = onSnapshot(doc(db, 'jobs', jobId), (doc) => {
      if (doc.exists()) {
        setJob({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [jobId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded': return <CloudUpload color="primary" />;
      case 'processing': return <Schedule color="warning" />;
      case 'processed': 
      case 'completed': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      default: return <Schedule color="disabled" />;
    }
  };

  const steps = [
    { label: 'File Uploaded', status: 'uploaded' },
    { label: 'Processing Data', status: 'processing' },
    { label: 'Analysis Complete', status: 'processed' }
  ];

  if (!job) return null;

  const activeStep = steps.findIndex(step => step.status === job.status);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Job Status: {job.fileName}
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} completed={index <= activeStep}>
            <StepLabel 
              icon={index === activeStep ? getStatusIcon(job.status) : undefined}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {index === activeStep && job.createdAt?.toDate().toLocaleString()}
              </Typography>
              {job.reportUrl && index === steps.length - 1 && (
                <Box component="a" href={job.reportUrl} target="_blank" sx={{ color: 'primary.main' }}>
                  Download Report
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default SimpleTimeline;