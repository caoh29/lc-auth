import { randomBytes } from 'crypto';
import { Database } from '../core/types';

export class StatefulSession {
  constructor(private readonly db: Database) { }

  async createSession(userId: string): Promise<string> {
    const sessionId = randomBytes(16).toString('hex');
    await this.db.saveSession(sessionId, { userId, expires: Date.now() + 3600000 }); // 1 hour
    return sessionId;
  }

  async verifySession(sessionId: string): Promise<string | null> {
    const session = await this.db.getSession(sessionId);
    if (session && session.expires > Date.now()) {
      return session.userId;
    }
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.deleteSession(sessionId);
  }
}