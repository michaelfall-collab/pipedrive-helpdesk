import express, { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';
import oauthRouter, { createAuthRedirect } from './oauth/index.js';
import { getClient } from './pipedrive/client.js';
import { db } from './database/index.js';
import { pipedriveTokens } from './database/schema.js';
import { desc } from 'drizzle-orm';
import modalRouter from './app-extensions/modal/index.js';

const app = express();

app.get('/', (req, res) => {
  res.send("CRM Helpdesk Backend is live and running with zero database dependencies!");
});

// ADD THIS NEW ROUTE HERE:
app.get('/login', (req, res) => {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return res.status(500).send("Error: Missing PIPEDRIVE_CLIENT_ID or PIPEDRIVE_REDIRECT_URI in Render Environment Variables.");
  }

  // Programmatically compiles the official Pipedrive initialization URL
  const pipedriveAuthUrl = `https://oauth.pipedrive.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  // Bounces your browser directly to Pipedrive's permission screen
  res.redirect(pipedriveAuthUrl);
});

const appExtensionAssetsPath = join(
  process.cwd(),
  'frontend/app-extension-ui/dist/assets',
);

app.use('/extensions/assets', express.static(appExtensionAssetsPath));

app.use('/oauth', oauthRouter);
app.use('/extensions/modal', modalRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send(err.message);
});

export default app;
