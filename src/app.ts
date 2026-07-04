import express, { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';
import oauthRouter, { createAuthRedirect } from './oauth/index.js';
import { getClient } from './pipedrive/client.js';
import { db } from './database/index.js';
import { pipedriveTokens } from './database/schema.js';
import { desc } from 'drizzle-orm';
import modalRouter from './app-extensions/modal/index.js';

const app = express();

app.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(pipedriveTokens)
      .orderBy(desc(pipedriveTokens.updatedAt))
      .limit(1);
    if (!rows[0]) {
      res.redirect(createAuthRedirect());
      return;
    }
    const client = await getClient(rows[0].pipedriveCompanyId);
    const deals = await client.deals.getDeals();
    res.json(deals);
  } catch (err) {
    next(err);
  }
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
