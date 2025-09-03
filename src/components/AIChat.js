import React, { useState } from 'react';
import { Paper, TextField, Button, Box, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { Send, Psychology } from '@mui/icons-material';
import { askGeminiQuestion } from '../services/geminiService';

const AIChat = ({ assessmentData }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleAskQuestion = async () => {
    if (!question.trim() || !assessmentData) return;

    setLoading(true);
    const userQuestion = question;
    setQuestion('');

    try {
      const response = await askGeminiQuestion(userQuestion, assessmentData);
      
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
    <Paper sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Assistant - Ask Questions About Your Infrastructure
      </Typography>

      {/* Chat History */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, maxHeight: '400px' }}>
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
                {chat.type === 'user' ? 'You:' : chat.type === 'error' ? 'Error:' : 'AI Assistant:'}
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

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
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