import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Paper } from '@mui/material';
import { getGoogleTokens } from '../api';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError(`Google OAuth error: ${error}`);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google');
        setLoading(false);
        return;
      }

      try {
        const tokens = await getGoogleTokens(code);
        // Store tokens in localStorage
        localStorage.setItem('googleTokens', JSON.stringify(tokens));
        
        // Redirect back to Google Connect page with success
        navigate('/google?success=true');
      } catch (err) {
        console.error('Token exchange error:', err);
        setError('Failed to exchange authorization code for tokens');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Connecting to Google...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we complete your Google authentication.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              You'll be redirected to the Google Connect page shortly.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return null; // Should not reach here
};

export default GoogleCallback;
