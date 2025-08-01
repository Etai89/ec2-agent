import axios from 'axios';


export const getAIResponse = async (prompt: string): Promise<string> => {
  const res = await axios.post('/api/ai', { prompt });
  return res.data.result;
};

export const getAIAgentResponse = async (prompt: string, accessToken?: string, refreshToken?: string): Promise<string> => {
  const res = await axios.post('/api/ai-agent', { 
    prompt, 
    accessToken, 
    refreshToken 
  });
  return res.data.result;
};


export const getGoogleAuthUrl = async (): Promise<string> => {
  const res = await axios.get('/api/google/auth');
  return res.data.url;
};


export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
};

export const getGoogleTokens = async (code: string): Promise<GoogleTokens> => {
  const res = await axios.get('/api/google/callback', { params: { code } });
  return res.data.tokens;
};


export type GoogleUser = {
  name?: string;
  email?: string;
};

export const getGoogleUserInfo = async (access_token: string, refresh_token?: string): Promise<GoogleUser> => {
  const res = await axios.get('/api/google/userinfo', { params: { access_token, refresh_token } });
  return res.data.user;
};


export type GoogleEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
};

export const getGoogleCalendarEvents = async (access_token: string, refresh_token?: string): Promise<GoogleEvent[]> => {
  const res = await axios.get('/api/google/calendar', { params: { access_token, refresh_token } });
  return res.data.events;
};

export const getGoogleGmailMessages = async (access_token: string, refresh_token?: string): Promise<any[]> => {
  const res = await axios.get('/api/google/gmail', { params: { access_token, refresh_token } });
  return res.data.messages;
};
