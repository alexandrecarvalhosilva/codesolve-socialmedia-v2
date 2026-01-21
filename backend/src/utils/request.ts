import { Request } from 'express';

export function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  let ip = (forwardedIp || req.socket.remoteAddress || req.ip || '').trim();

  if (!ip) return null;

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  } else if (ip === '::1') {
    ip = '127.0.0.1';
  }

  return ip;
}
