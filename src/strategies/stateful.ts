import { randomBytes } from 'crypto';
import { Database } from '../core/types';

export class StatefulSession {
  constructor(private readonly db: Database) { }

  async createSession(userUniqueIdentifier: string): Promise<string> {
    const sessionId = randomBytes(16).toString('hex');
    await this.db.saveSession(sessionId, { sub: userUniqueIdentifier, exp: Math.floor(Date.now() / 1000) + 1800 }); // 30 minutes
    return sessionId;
  }

  async verifySession(sessionId: string): Promise<string | null> {
    const session = await this.db.getSession(sessionId);
    if (session && session.exp > Date.now()) {
      return session.sub;
    }
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.deleteSession(sessionId);
  }
}