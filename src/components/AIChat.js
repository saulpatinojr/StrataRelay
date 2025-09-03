import React, { useState } from 'react';
import { Paper, TextField, Button, Box, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { Send, Psychology, Refresh, AttachFile } from '@mui/icons-material';
import { askGeminiQuestion } from '../services/geminiService';

const AIChat = ({ assessmentData }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [vmList, setVmList] = useState([]);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.csv')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const vms = lines.map(line => line.trim()).filter(line => line);
      setVmList(vms);
      setChatHistory(prev => [...prev, 
        { type: 'ai', message: `Uploaded ${vms.length} VM names from CSV file.` }
      ]);
    };
    reader.readAsText(file);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setChatHistory(prev => [...prev, 
        { type: 'error', message: 'Please enter a question.' }
      ]);
      return;
    }
    
    if (!assessmentData) {
      setChatHistory(prev => [...prev, 
        { type: 'error', message: 'No assessment data available. Please upload data first.' }
      ]);
      return;
    }

    setLoading(true);
    const userQuestion = question;
    setQuestion('');

    // Build comprehensive VM context
    let context = '';
    if (vmList.length > 0 && assessmentData) {
      const vmDetails = vmList.map(vmName => {
        // Find VM in vInfo
        const vmInfo = assessmentData.vInfo?.find(vm => 
          vm.VM && vm.VM.toLowerCase().includes(vmName.toLowerCase())
        );
        
        // Find related CPU data
        const cpuData = assessmentData.vCPU?.find(cpu => 
          cpu.VM && cpu.VM.toLowerCase().includes(vmName.toLowerCase())
        );
        
        // Find related memory data
        const memData = assessmentData.vMemory?.find(mem => 
          mem.VM && mem.VM.toLowerCase().includes(vmName.toLowerCase())
        );
        
        // Find related disk data
        const diskData = assessmentData.vDisk?.filter(disk => 
          disk.VM && disk.VM.toLowerCase().includes(vmName.toLowerCase())
        );
        
        return {
          vmName,
          basicInfo: vmInfo,
          cpuMetrics: cpuData,
          memoryMetrics: memData,
          diskMetrics: diskData
        };
      }).filter(vm => vm.basicInfo); // Only include VMs we found data for
      
      context = `Detailed VM Analysis for ${vmDetails.length} VMs:\n${JSON.stringify(vmDetails, null, 2)}\n\n`;
    }
    
    const fullContext = `${context}Infrastructure Summary: Total VMs: ${assessmentData.totalVMs || 0}, Total CPU: ${assessmentData.compute?.totalCPU || 0}, Total Memory: ${Math.round(assessmentData.compute?.totalMemoryGB || 0)}GB\n\nQuestion: ${userQuestion}`;

    try {
      const response = await askGeminiQuestion(fullContext, assessmentData);
      
      setChatHistory(prev => [
        ...prev,
        { type: 'user', message: userQuestion },
        { type: 'ai', message: response }
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev,
        { type: 'user', message: userQuestion },
        { type: 'error', message: 'Failed to get AI response. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the top 3 migration risks for this infrastructure?",
    "Which VMs should be prioritized for cloud migration?",
    "What cost savings opportunities do you see?",
    "Are there any licensing optimization recommendations?",
    "What cloud SKUs would you recommend for our largest VMs?"
  ];

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
          Strata AI - Ask Questions About Your Infrastructure
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={() => setChatHistory([])}
          disabled={chatHistory.length === 0}
        >
          Start Over
        </Button>
      </Box>

      {/* Chat History */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        {chatHistory.length === 0 ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ask me anything about your cloud assessment data:
            </Typography>
            <List dense>
              {suggestedQuestions.map((q, index) => (
                <ListItem 
                  key={index} 
                  button 
                  onClick={() => setQuestion(q)}
                  sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 1 }}
                >
                  <ListItemText 
                    primary={q} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          chatHistory.map((chat, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                color={chat.type === 'user' ? 'primary' : chat.type === 'error' ? 'error' : 'secondary'}
              >
                {chat.type === 'user' ? 'You:' : chat.type === 'error' ? 'Error:' : 'Strata AI:'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  bgcolor: chat.type === 'user' ? 'primary.light' : 'background.default',
                  p: 1,
                  borderRadius: 1,
                  color: chat.type === 'user' ? 'primary.contrastText' : 'text.primary'
                }}
              >
                {chat.message}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* VM List Display */}
      {vmList.length > 0 && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Uploaded VMs ({vmList.length}): {vmList.slice(0, 5).join(', ')}{vmList.length > 5 ? '...' : ''}
          </Typography>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          <Button
            component="span"
            variant="outlined"
            startIcon={<AttachFile />}
            sx={{ minWidth: '120px' }}
          >
            Upload CSV
          </Button>
        </label>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about your infrastructure data..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
          disabled={loading || !assessmentData}
        />
        <Button
          variant="contained"
          onClick={handleAskQuestion}
          disabled={loading || !question.trim() || !assessmentData}
          sx={{ minWidth: '60px' }}
        >
          {loading ? <CircularProgress size={24} /> : <Send />}
        </Button>
      </Box>
    </Paper>
  );
};

export default AIChat;