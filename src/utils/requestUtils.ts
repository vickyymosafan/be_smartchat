import { Request } from 'express';

export function extractClientIp(req: Request): string {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  return rawIp.replace('::ffff:', '');
}

export function extractUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}
