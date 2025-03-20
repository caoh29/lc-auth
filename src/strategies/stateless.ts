import { signJWT, verifyJWT } from '../core/crypto';

export class StatelessSession {
  constructor(private readonly secret: string) { }

  createToken(userId: string): string {
    return signJWT({ userId, expires: Math.floor(Date.now() / 1000) + 3600 }, this.secret);
  }

  verifyToken(token: string): string | null {
    const payload = verifyJWT(token, this.secret);
    if (payload && payload.expires > Math.floor(Date.now() / 1000)) {
      return payload.userId;
    }
    return null;
  }
}