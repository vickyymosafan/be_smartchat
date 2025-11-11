import crypto from 'crypto';

export const SESSION_EXPIRY = {
  AUTH_TOKEN: 24 * 60 * 60 * 1000,
  REGULAR_SESSION: 30 * 24 * 60 * 60 * 1000,
} as const;

export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `session-${timestamp}-${random}`;
}

export function calculateExpiryDate(durationMs: number): Date {
  return new Date(Date.now() + durationMs);
}
