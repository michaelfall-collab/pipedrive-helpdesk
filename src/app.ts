import express, { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';
import * as v2 from 'pipedrive/v2';
import modalRouter from './app-extensions/modal/index.js';
import oauthRouter, { createAuthRedirect } from './oauth/index.js';
import { getClient } from './pipedrive/client.js';
import { db } from './database/index.js';
import { pipedriveTokens } from './database/schema.js';
import { desc } from 'drizzle-orm';
import modalRouter from './app-extensions/modal/index.js';

const app = express();

function createOauth2() {
  return new v2.OAuth2Configuration({
    clientId: process.env.PIPEDRIVE_CLIENT_ID ?? '',
    clientSecret: process.env.PIPEDRIVE_CLIENT_SECRET ?? '',
    redirectUri: process.env.PIPEDRIVE_REDIRECT_URI ?? '',
  });
}

app.get('/', (req, res) => {
  res.send("CRM Helpdesk Backend is live and running with zero database dependencies!");
});

// 1. Static Root Confirmation Route
app.get('/', (req, res) => {
  res.send("CRM Helpdesk Backend is live and running with zero database dependencies!");
});

// 2. Clear Login Initialization Route
app.get('/login', (req, res) => {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return res.status(500).send("Error: Missing PIPEDRIVE_CLIENT_ID or PIPEDRIVE_REDIRECT_URI in Render Settings.");
  }

  const pipedriveAuthUrl = `https://oauth.pipedrive.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(pipedriveAuthUrl);
});

// 3. Precise, Non-Nested Handshake Callback Route
app.get('/oauth/callback', async (req, res, next) => {
  const { code } = req.query as { code?: string };

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const oauth2 = createOauth2();
    const token = await oauth2.authorize(code);

    if (!token.api_domain) {
      throw new Error('Missing api_domain in token response');
    }

    const apiDomain = token.api_domain
      .replace('https://', '')
      .replace('http://', '');
      
    // Handshake confirmation check directly with Pipedrive API
    const response = await fetch(`https://${apiDomain}/v1/users/me`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    if (!response.ok) {
      throw new Error(`/v1/users/me returned ${response.status}`);
    }

    console.log("OAuth Connection Verified and Approved Successfully!");
    // Redirects user cleanly back to the home route upon completion
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Static asset delivery configurations for your React frontend bundle
const appExtensionAssetsPath = join(
  process.cwd(),
  'frontend/app-extension-ui/dist/assets',
);
app.use('/extensions/assets', express.static(appExtensionAssetsPath));
app.use('/extensions/modal', modalRouter);

// Global Error Catcher
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send(err.message);
});

export default app;
