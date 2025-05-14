import { signJWT, verifyJWT } from '../core/crypto';

export class StatelessSession {
  constructor(private readonly secret: string) { }

  createToken(userUniqueIdentifier: string): string {
    return signJWT({ sub: userUniqueIdentifier, exp: Math.floor(Date.now() / 1000) + 1800 }, this.secret);
  }

  verifyToken(token: string): string | null {
    const payload = verifyJWT(token, this.secret);
    if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
      return payload.sub;
    }
    return null;
  }
}