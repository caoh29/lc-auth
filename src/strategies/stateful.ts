import { Database } from '../core/types';

export class StatefulSession {
  constructor(private readonly db: Database) { }

  async createSession(userUniqueIdentifier: string, expiresAt?: number): Promise<string> {
    return await this.db.createSession(userUniqueIdentifier, expiresAt ?? Math.floor(Date.now() / 1000) + 1800); // 30 minutes
  }

  async verifySession(sessionIdOrToken: string): Promise<string | null> {
    const session = await this.db.getSession(sessionIdOrToken);
    if (session && session.exp > Date.now()) {
      return session.sub;
    }
    return null;
  }

  async deleteSession(sessionIdOrToken: string): Promise<void> {
    await this.db.deleteSession(sessionIdOrToken);
  }
}