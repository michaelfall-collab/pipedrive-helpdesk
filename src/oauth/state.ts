import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const STATE_TTL_MS = 5 * 60 * 1000;

function base64url(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function getClientSecret(): string {
  const secret = process.env.PIPEDRIVE_CLIENT_SECRET;
  if (!secret) throw new Error('PIPEDRIVE_CLIENT_SECRET is required');
  return secret;
}

export function createState(): string {
  const payload = JSON.stringify({
    nonce: randomBytes(16).toString('hex'),
    exp: Date.now() + STATE_TTL_MS,
  });
  const encoded = base64url(payload);
  const sig = createHmac('sha256', getClientSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyState(state: string): boolean {
  const dot = state.lastIndexOf('.');
  if (dot === -1) return false;
  const encoded = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac('sha256', getClientSecret())
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig, 'base64url');
  const expectedBuf = Buffer.from(expected, 'base64url');
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  )
    return false;
  try {
    const { exp } = JSON.parse(
      Buffer.from(encoded, 'base64url').toString(),
    ) as { exp: number };
    return Date.now() < exp;
  } catch {
    return false;
  }
}
