// --- Imports ---
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { google } from 'googleapis';

// --- Config ---
dotenv.config();


const app = express();
// --- Security HTTP headers ---
app.use(helmet());

// --- CORS options (adjust origin for production) ---
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://gagent.etai.co.il',
    'http://gagent.etai.co.il'
  ],
  credentials: true,
}));

app.use(express.json());

// --- Health Check ---
app.get('/', (req: Request, res: Response) => {
  res.send('AI Agent Backend is running');
});

// --- API Status Endpoint ---
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- Enhanced AI Agent with Google Integration ---
app.post('/api/ai-agent', async (req: Request, res: Response) => {
  try {
    const { prompt, accessToken, refreshToken } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    let contextData = '';
    
    // If user has Google tokens, fetch their data for context
    if (accessToken) {
      try {
        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        
        // Get calendar events
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const events = await calendar.events.list({
          calendarId: 'primary',
          maxResults: 5,
          singleEvents: true,
          orderBy: 'startTime',
          timeMin: new Date().toISOString(),
        });

        contextData = `User: ${userInfo.data.name} (${userInfo.data.email})
Upcoming Calendar Events:
${events.data.items?.map(event => 
  `- ${event.summary} (${event.start?.dateTime || event.start?.date})`
).join('\n') || 'No upcoming events'}

`;
      } catch (err) {
        console.log('Failed to fetch Google data:', err);
      }
    }

    const systemMessage = `You are a helpful AI assistant with access to the user's Google services. 
${contextData ? `Here's the user's current context:\n${contextData}` : ''}
You can help with calendar management, email insights, and personal productivity. Always be helpful and accurate.`;

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ 
        result: `AI Agent Echo: ${prompt}${contextData ? '\n\nWith Google Context:\n' + contextData : ''}`,
        response: `AI Agent Echo: ${prompt}${contextData ? '\n\nWith Google Context:\n' + contextData : ''}`,
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
    });
    
    const result = completion.choices[0].message?.content || 'No response';
    res.json({ 
      result,
      response: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (err) {
    console.error('AI Agent error:', err);
    res.json({ 
      result: `AI Agent Echo: ${req.body.prompt}`,
      response: `AI Agent Echo: ${req.body.prompt}`,
      timestamp: new Date().toISOString(),
      status: 'fallback'
    });
  }
});

// --- Original AI Endpoint (without Google integration) ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/ai', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    
    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ 
        result: `AI Echo: ${prompt}`,
        response: `AI Echo: ${prompt}`,
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    const result = completion.choices[0].message?.content || 'No response';
    res.json({ 
      result,
      response: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (err) {
    console.error('AI error:', err);
    res.json({ 
      result: `AI Echo: ${req.body.prompt}`,
      response: `AI Echo: ${req.body.prompt}`,
      timestamp: new Date().toISOString(),
      status: 'fallback'
    });
  }
});

// --- Google OAuth2 Setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://gagent.etai.co.il/api/google/callback'
);

// --- Google Auth URL Endpoint ---
app.get('/api/google/auth', (req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.json({ url });
});


// --- Google OAuth2 Callback Endpoint ---
app.get('/api/google/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect('https://gagent.etai.co.il/google?error=' + encodeURIComponent(error as string));
  }

  if (!code) {
    console.error('No authorization code received');
    return res.redirect('https://gagent.etai.co.il/google?error=no_code');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    
    // Store or process the tokens as needed
    console.log('OAuth tokens received:', {
      access_token: tokens.access_token ? '***EXISTS***' : 'MISSING',
      refresh_token: tokens.refresh_token ? '***EXISTS***' : 'MISSING',
      expiry_date: tokens.expiry_date
    });
    
    // Redirect back to frontend with success
    res.redirect('https://gagent.etai.co.il/google?success=true&access_token=' + encodeURIComponent(tokens.access_token || ''));
    
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.redirect('https://gagent.etai.co.il/google?error=' + encodeURIComponent('token_exchange_failed'));
  }
});

// --- Google User Info Endpoint ---
app.get('/api/google/userinfo', async (req: Request, res: Response) => {
  const { access_token, refresh_token } = req.query;
  if (!access_token) return res.status(400).json({ error: 'Missing access_token' });
  oauth2Client.setCredentials({
    access_token: access_token as string,
    refresh_token: refresh_token as string | undefined,
  });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  try {
    const userinfo = await oauth2.userinfo.get();
    res.json({ user: userinfo.data });
  } catch (err) {
    res.status(500).json({ error: 'Google UserInfo error', details: err });
  }
});

// --- Google Calendar Events Endpoint ---
app.get('/api/google/calendar', async (req: Request, res: Response) => {
  // In production, get tokens from user session or DB
  const { access_token, refresh_token } = req.query;
  if (!access_token) return res.status(400).json({ error: 'Missing access_token' });
  oauth2Client.setCredentials({
    access_token: access_token as string,
    refresh_token: refresh_token as string | undefined,
  });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    const events = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: new Date().toISOString(),
    });
    res.json({ events: events.data.items });
  } catch (err) {
    res.status(500).json({ error: 'Google Calendar error', details: err });
  }
});

// --- Google Gmail Messages Endpoint ---
app.get('/api/google/gmail', async (req: Request, res: Response) => {
  const { access_token, refresh_token } = req.query;
  if (!access_token) return res.status(400).json({ error: 'Missing access_token' });
  oauth2Client.setCredentials({
    access_token: access_token as string,
    refresh_token: refresh_token as string | undefined,
  });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  try {
    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'is:unread'
    });
    res.json({ messages: messages.data.messages || [] });
  } catch (err) {
    res.status(500).json({ error: 'Google Gmail error', details: err });
  }
});

// --- Error Handling Middleware ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err?.message || err });
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
