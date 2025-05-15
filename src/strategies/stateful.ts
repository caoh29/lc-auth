import { Database, Session } from '../core/types';

export class StatefulSession {
  constructor(private readonly db: Database) { }

  async createSession(userUniqueIdentifier: string, expiresAt?: number): Promise<string> {
    if (!this.db.createSession) {
      throw new Error('createSession is not implemented');
    }
    return await this.db.createSession(userUniqueIdentifier, expiresAt ?? Math.floor(Date.now() / 1000) + 1800); // 30 minutes
  }

  async getSession(sessionIdOrToken: string): Promise<Session | null> {
    if (!this.db.getSession) {
      throw new Error('getSession is not implemented');
    }
    return await this.db.getSession(sessionIdOrToken);
  }

  async verifySession(sessionIdOrToken: string): Promise<string | null> {
    if (!this.db.getSession) {
      throw new Error('getSession is not implemented');
    }
    const session = await this.db.getSession(sessionIdOrToken);
    if (session && session.expiresAt > Date.now()) {
      return session.userId;
    }
    return null;
  }

  async deleteSession(sessionIdOrToken: string): Promise<void> {
    if (!this.db.deleteSession) {
      throw new Error('deleteSession is not implemented');
    }
    await this.db.deleteSession(sessionIdOrToken);
  }
}