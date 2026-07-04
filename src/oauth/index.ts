import { Router } from 'express';
import * as v2 from 'pipedrive/v2';
import { upsertToken } from '../database/tokenRepository.js';
import { createState, verifyState } from './state.js';

function createOauth2() {
  return new v2.OAuth2Configuration({
    clientId: process.env.PIPEDRIVE_CLIENT_ID ?? '',
    clientSecret: process.env.PIPEDRIVE_CLIENT_SECRET ?? '',
    redirectUri: process.env.PIPEDRIVE_REDIRECT_URI ?? '',
  });
}

export function createAuthRedirect(): string {
  const state = createState();
  const oauth2 = createOauth2();
  return `${oauth2.authorizationUrl}&state=${encodeURIComponent(state)}`;
}

const router = Router();

router.get('/oauth/callback', async (req, res, next) => {
  const { code, state } = req.query as { code?: string; state?: string };

//if (!state || !verifyState(state)) {
//  res.status(400).send('Invalid state parameter');
//  return;
//}

  if (!code) {
    res.status(400).send('Missing authorization code');
    return;
  }

  try {
    const oauth2 = createOauth2();
    const token = await oauth2.authorize(code);

    if (!token.api_domain)
      throw new Error('Missing api_domain in token response');

    const apiDomain = token.api_domain
      .replace('https://', '')
      .replace('http://', '');
    const response = await fetch(`https://${apiDomain}/v1/users/me`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    if (!response.ok)
      throw new Error(`/v1/users/me returned ${response.status}`);

    const { data } = (await response.json()) as {
      data: { id: number; company_id: number };
    };

//  await upsertToken(data.company_id, data.id, token);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

export default router;
