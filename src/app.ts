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
  // Completely bypassed database queries so the server stays live
  res.send("CRM Helpdesk Backend is live and running with zero database dependencies!");
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
