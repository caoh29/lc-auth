import { signJWT, verifyJWT } from '../core/crypto';
import { TokenPayload } from '../core/types';

export class StatelessSession {
  constructor(private readonly secret: string) { }

  createToken(userUniqueIdentifier: string, expiresAt?: number): string {
    return signJWT({
      sub: userUniqueIdentifier,
      exp: expiresAt ?? Math.floor(Date.now() / 1000) + 1800,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    }, this.secret); // 30 minutes
  }

  verifyToken(token: string): string | null {
    const payload = verifyJWT(token, this.secret);
    if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
      return payload.sub;
    }
    return null;
  }

  getTokenPayload(token: string): TokenPayload | null {
    return verifyJWT(token, this.secret);
  }
}