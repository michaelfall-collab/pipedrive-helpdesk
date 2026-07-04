import { and, desc, eq } from 'drizzle-orm';
import type { TokenResponse } from 'pipedrive/v2';
import { db } from './index.js';
import { pipedriveTokens } from './schema.js';
import { encrypt, decrypt } from '../crypto/encrypt.js';

const REFRESH_TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000;

export type StoredToken = {
  companyId: number;
  userId: number;
  token: TokenResponse;
};

function toTokenResponse(
  row: typeof pipedriveTokens.$inferSelect,
): TokenResponse {
  return {
    access_token: decrypt(row.accessToken),
    refresh_token: decrypt(row.refreshToken),
    token_type: row.tokenType,
    expires_in: Math.max(
      0,
      Math.floor((row.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
    ),
    scope: row.scope ?? '',
    api_domain: row.apiDomain,
  };
}

export async function getToken(
  companyId: number,
  userId: number,
): Promise<StoredToken | null> {
  const rows = await db
    .select()
    .from(pipedriveTokens)
    .where(
      and(
        eq(pipedriveTokens.pipedriveCompanyId, companyId),
        eq(pipedriveTokens.pipedriveUserId, userId),
      ),
    )
    .limit(1);
  if (!rows[0]) return null;
  return { companyId, userId, token: toTokenResponse(rows[0]) };
}

export async function getTokenByCompany(
  companyId: number,
): Promise<StoredToken | null> {
  const rows = await db
    .select()
    .from(pipedriveTokens)
    .where(eq(pipedriveTokens.pipedriveCompanyId, companyId))
    .orderBy(desc(pipedriveTokens.updatedAt))
    .limit(1);
  if (!rows[0]) return null;
  return {
    companyId,
    userId: rows[0].pipedriveUserId,
    token: toTokenResponse(rows[0]),
  };
}

export async function upsertToken(
  companyId: number,
  userId: number,
  token: TokenResponse,
): Promise<void> {
  const now = new Date();
  const accessTokenExpiresAt = new Date(Date.now() + token.expires_in * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await db
    .insert(pipedriveTokens)
    .values({
      pipedriveCompanyId: companyId,
      pipedriveUserId: userId,
      accessToken: encrypt(token.access_token),
      refreshToken: encrypt(token.refresh_token),
      tokenType: token.token_type,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scope: token.scope,
      apiDomain: token.api_domain,
      createdAt: now,
      updatedAt: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        accessToken: encrypt(token.access_token),
        refreshToken: encrypt(token.refresh_token),
        tokenType: token.token_type,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        scope: token.scope,
        apiDomain: token.api_domain,
        updatedAt: now,
      },
    });
}
