import { Request } from 'express';

export function extractClientIp(req: Request): string {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  return rawIp.replace('::ffff:', '');
}

export function extractUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

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
