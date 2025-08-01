import React, { useState } from 'react';
import { Button, Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import { getGoogleAuthUrl, getGoogleTokens, getGoogleUserInfo, getGoogleCalendarEvents } from '../api';
import { useSearchParams } from 'react-router-dom';



type GoogleEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
};
type GoogleUser = {
  name?: string;
  email?: string;
};
type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
};

const GoogleConnect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [tokens, setTokens] = useState<GoogleTokens | null>(null);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success parameter from callback
  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Remove success parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await getGoogleAuthUrl();
      setAuthUrl(url);
      window.location.href = url;
    } catch (err) {
      setError('Failed to get Google Auth URL.');
    }
    setLoading(false);
  };

  const handleDisconnect = () => {
    setTokens(null);
    setUser(null);
    setEvents([]);
    localStorage.removeItem('googleTokens');
  };

  // Handle OAuth2 callback
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && !tokens) {
      setLoading(true);
      setError(null);
      getGoogleTokens(code)
        .then(t => {
          setTokens(t);
          // Store tokens in localStorage for AI agent to use
          localStorage.setItem('googleTokens', JSON.stringify(t));
          setShowSuccess(true);
        })
        .catch(() => setError('Failed to get Google tokens.'))
        .finally(() => setLoading(false));
    }
  }, [tokens]);

  // Check for stored tokens on component mount
  React.useEffect(() => {
    const storedTokens = localStorage.getItem('googleTokens');
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
    }
  }, []);

  // Fetch user info and calendar events after tokens
  React.useEffect(() => {
    if (tokens?.access_token) {
      setLoading(true);
      setError(null);
      Promise.all([
        getGoogleUserInfo(tokens.access_token, tokens.refresh_token).then(setUser),
        getGoogleCalendarEvents(tokens.access_token, tokens.refresh_token).then(setEvents)
      ]).catch(() => setError('Failed to fetch user info or events.'))
        .finally(() => setLoading(false));
    }
  }, [tokens]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Connect your Google Account
        </Typography>
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
            Successfully connected to Google! Your account is now linked.
          </Alert>
        )}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {!tokens && (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleConnect} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Connect with Google'}
            </Button>
          </Box>
        )}
        {user && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Welcome, {user.name}</Typography>
            <Typography variant="body2">Email: {user.email}</Typography>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleDisconnect}
              sx={{ mt: 2 }}
            >
              Disconnect Google Account
            </Button>
          </Box>
        )}
        {events.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Upcoming Calendar Events</Typography>
            <ul>
              {events.map((ev: GoogleEvent) => (
                <li key={ev.id}>
                  {ev.summary || 'No Title'} ({ev.start?.dateTime || ev.start?.date || 'No Date'})
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default GoogleConnect;
