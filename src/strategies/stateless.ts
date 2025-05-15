import { signJWT, verifyJWT } from '../core/crypto';

export class StatelessSession {
  constructor(private readonly secret: string) { }

  createToken(userUniqueIdentifier: string, expiresAt?: number): string {
    return signJWT({ sub: userUniqueIdentifier, exp: expiresAt ?? Math.floor(Date.now() / 1000) + 1800 }, this.secret); // 30 minutes
  }

  verifyToken(token: string): string | null {
    const payload = verifyJWT(token, this.secret);
    if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
      return payload.sub;
    }
    return null;
  }
}