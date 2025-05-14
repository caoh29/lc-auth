import { scryptSync, randomBytes, createHmac } from 'crypto';
import { Session } from './types';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(stored: string, supplied: string): boolean {
  const [salt, hash] = stored.split(':');
  const suppliedHash = scryptSync(supplied, salt, 64).toString('hex');
  return hash === suppliedHash;
}

export function signJWT(payload: Session, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(token: string, secret: string): Session | null {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  const expectedSignature = createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  // Prevent unsigned tokens from being accepted
  if (signature !== expectedSignature) return null;
  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
  } catch {
    return null;
  }
}

export function generateCodeVerifier(): string {
  return randomBytes(64).toString('base64url');
}

export function generateCodeChallenge(codeVerifier: string): string {
  return createHmac('sha256', codeVerifier).digest('base64url');
}
