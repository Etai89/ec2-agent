import React from 'react';

import { CssBaseline, ThemeProvider, Box, AppBar, Toolbar, Button } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import Home from './pages/Home';
import GoogleConnect from './pages/GoogleConnect';
import GoogleCallback from './pages/GoogleCallback';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  typography: {
    fontFamily: 'Roboto, Arial',
  },
});


const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={RouterLink} to="/">
            AI Chat
          </Button>
          <Button color="inherit" component={RouterLink} to="/google">
            Google Connect
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai" element={<Home />} />
          <Route path="/google" element={<GoogleConnect />} />
          <Route path="/api/google/callback" element={<GoogleCallback />} />
        </Routes>
      </Box>
    </Router>
  </ThemeProvider>
);

export default App;
