/**
 * Session Utilities
 * Common utilities for session management
 */

import crypto from 'crypto';

/**
 * Session expiry durations in milliseconds
 */
export const SESSION_EXPIRY = {
  /** 24 hours for auth tokens */
  AUTH_TOKEN: 24 * 60 * 60 * 1000,
  /** 30 days for regular sessions */
  REGULAR_SESSION: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Generate a unique session ID
 * Format: session-{timestamp}-{random}
 * 
 * @returns Unique session ID string
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `session-${timestamp}-${random}`;
}

/**
 * Calculate expiry date from now
 * 
 * @param durationMs - Duration in milliseconds
 * @returns Date object representing expiry time
 */
export function calculateExpiryDate(durationMs: number): Date {
  return new Date(Date.now() + durationMs);
}

/**
 * Generate a secure random token
 * Format: auth_{64-char-hex}
 * 
 * @returns Secure random token string
 */
export function generateAuthToken(): string {
  const randomBytes = crypto.randomBytes(32);
  return `auth_${randomBytes.toString('hex')}`;
}
