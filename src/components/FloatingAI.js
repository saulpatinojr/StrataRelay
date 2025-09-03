import React, { useState } from 'react';
import { Fab, Dialog, DialogContent, IconButton, Box } from '@mui/material';
import { Psychology, Close } from '@mui/icons-material';
import AIChat from './AIChat';

const FloatingAI = ({ assessmentData }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <Psychology />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: '800px', minHeight: '600px' }
        }}
      >
        <Box display="flex" justifyContent="flex-end" p={1}>
          <IconButton onClick={() => setOpen(false)} size="small">
            <Close />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 2, pt: 0, height: '100%' }}>
          <AIChat assessmentData={assessmentData} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingAI;