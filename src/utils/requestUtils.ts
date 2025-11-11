/**
 * Request Utilities
 * Common utilities for extracting data from Express requests
 */

import { Request } from 'express';

/**
 * Extract client IP address from request
 * Handles proxy forwarding and IPv6 mapping
 * 
 * @param req - Express request object
 * @returns Clean IP address string
 */
export function extractClientIp(req: Request): string {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  return rawIp.replace('::ffff:', '');
}

/**
 * Extract user agent from request
 * 
 * @param req - Express request object
 * @returns User agent string or 'unknown'
 */
export function extractUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Extract Bearer token from Authorization header
 * 
 * @param req - Express request object
 * @returns Token string or null if not found/invalid format
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
