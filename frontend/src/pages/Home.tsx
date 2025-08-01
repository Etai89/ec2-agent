import React, { useState, useEffect } from 'react';
import { Box, Button, Container, TextField, Typography, CircularProgress, Paper } from '@mui/material';
import { getAIResponse, getAIAgentResponse } from '../api';

const Home: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleTokens, setGoogleTokens] = useState<any>(null);

  // Check for stored Google tokens
  useEffect(() => {
    const tokens = localStorage.getItem('googleTokens');
    if (tokens) {
      setGoogleTokens(JSON.parse(tokens));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    try {
      let result;
      if (googleTokens?.access_token) {
        // Use enhanced AI agent with Google integration
        result = await getAIAgentResponse(prompt, googleTokens.access_token, googleTokens.refresh_token);
      } else {
        // Use basic AI without Google integration
        result = await getAIResponse(prompt);
      }
      setResponse(result);
    } catch (err) {
      setResponse('Error getting AI response.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Smart AI Agent
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Ask anything..."
            fullWidth
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
            margin="normal"
            multiline
            minRows={2}
            required
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Ask AI'}
            </Button>
          </Box>
        </form>
        {response && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" color="secondary">AI Response:</Typography>
            <Paper sx={{ p: 2, mt: 1, background: '#f5f5f5' }}>{response}</Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Home;
