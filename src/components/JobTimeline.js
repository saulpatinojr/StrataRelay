import React, { useEffect, useState } from 'react';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { Typography, Paper, Box } from '@mui/material';
import { CheckCircle, Schedule, Error, CloudUpload } from '@mui/icons-material';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const JobTimeline = ({ jobId }) => {
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
      case 'uploaded': return <CloudUpload />;
      case 'processing': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'error': return <Error />;
      default: return <Schedule />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'processing': return 'warning';
      default: return 'grey';
    }
  };

  if (!job) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Job Status: {job.fileName}</Typography>
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color={getStatusColor(job.status)}>
              {getStatusIcon(job.status)}
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">{job.status.toUpperCase()}</Typography>
            <Typography variant="body2" color="text.secondary">
              {job.createdAt?.toDate().toLocaleString()}
            </Typography>
          </TimelineContent>
        </TimelineItem>
        {job.reportUrl && (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color="success">
                <CheckCircle />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6">Report Ready</Typography>
              <Box component="a" href={job.reportUrl} target="_blank" sx={{ color: 'primary.main' }}>
                Download Report
              </Box>
            </TimelineContent>
          </TimelineItem>
        )}
      </Timeline>
    </Paper>
  );
};

export default JobTimeline;