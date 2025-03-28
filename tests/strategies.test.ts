// tests/strategies.test.ts
import { describe, it } from 'node:test';
import { strictEqual, ok } from 'assert';
import { LocalAuth } from '../src/strategies/local';
import { OAuth } from '../src/strategies/oauth';
import { StatefulSession } from '../src/strategies/stateful';
import { StatelessSession } from '../src/strategies/stateless';
import { Database, OAuthProviderConfig } from '../src/core/types';
import { hashPassword, signJWT, verifyJWT } from '../src/core/crypto';

// Mock Database Implementation
const mockDb: Database = {
  async findUserByUsername(username: string) {
    return username === 'testuser' ? { id: '1', username: 'testuser', passwordHash: hashPassword('testpass') } : null;
  },
  async createUser(user) {
    return Promise.resolve();
  },
  async saveSession(sessionId, data) {
    return Promise.resolve();
  },
  async getSession(sessionId) {
    return sessionId === 'validSession' ? { userId: '1', expires: Date.now() + 3600000 } : null;
  },
  async deleteSession(userId) {
    return Promise.resolve();
  },
  async findUserById(userId) {
    return userId === '1' ? { id: '1', username: 'XXXXXXXX', passwordHash: hashPassword('testpass') } : null;
  }
};

describe('Authentication Strategies', () => {
  // LocalAuth Tests
  describe('LocalAuth', () => {
    const localAuth = new LocalAuth(mockDb);

    it('should register a new user', async () => {
      const user = await localAuth.register('newuser', 'newpass');
      strictEqual(user.username, 'newuser', 'User should be registered with correct username');
      ok(user.passwordHash, 'Password should be hashed');
    });

    it('should login with correct credentials', async () => {
      const user = await localAuth.login('testuser', 'testpass');
      strictEqual(user?.id, '1', 'Login should succeed with correct credentials');
    });

    it('should fail login with incorrect password', async () => {
      const user = await localAuth.login('testuser', 'wrongpass');
      strictEqual(user, null, 'Login should fail with incorrect password');
    });

    it('should fail login with non-existent user', async () => {
      const user = await localAuth.login('nonexistent', 'testpass');
      strictEqual(user, null, 'Login should fail for non-existent user');
    });
  });

  // OAuth Tests
  describe('OAuth', () => {
    const config: OAuthProviderConfig = {
      authUrl: 'https://example.com/auth',
      tokenUrl: 'https://example.com/token',
      clientId: 'client123',
      clientSecret: 'secret123',
      redirectUri: 'https://myapp.com/callback',
      scope: 'email profile'
    };
    const oauth = new OAuth(config);

    it('should generate a correct authorization URL', () => {
      const state = 'randomstate';
      const url = oauth.getAuthUrl(state);
      const expected = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=${config.scope}&state=${state}&response_type=code`;
      strictEqual(url, expected, 'Auth URL should match expected format');
    });

    // Note: Testing exchangeCode requires mocking HTTP requests, which is complex without dependencies.
    // For simplicity, assume it’s tested in integration tests with a real server.
  });

  // StatefulSession Tests
  describe('StatefulSession', () => {
    const stateful = new StatefulSession(mockDb);

    it('should create a session', async () => {
      const sessionId = await stateful.createSession('1');
      ok(sessionId.length > 0, 'Session ID should be generated');
    });

    it('should verify a valid session', async () => {
      const userId = await stateful.verifySession('validSession');
      strictEqual(userId, '1', 'Valid session should return user ID');
    });

    it('should return null for invalid session', async () => {
      const userId = await stateful.verifySession('invalidSession');
      strictEqual(userId, null, 'Invalid session should return null');
    });
  });

  // StatelessSession Tests
  describe('StatelessSession', () => {
    const stateless = new StatelessSession('mysecret');

    it('should create a valid token', () => {
      const token = stateless.createToken('1');
      const decoded = verifyJWT(token, 'mysecret');
      strictEqual(decoded?.userId, '1', 'Token should contain user ID');
    });

    it('should verify a valid token', () => {
      const token = stateless.createToken('1');
      const userId = stateless.verifyToken(token);
      strictEqual(userId, '1', 'Valid token should verify');
    });

    it('should return null for invalid token', () => {
      const userId = stateless.verifyToken('invalid.token.here');
      strictEqual(userId, null, 'Invalid token should return null');
    });

    it('should return null for expired token', () => {
      const token = signJWT({ userId: '1', expires: Math.floor(Date.now() / 1000) - 3600 }, 'mysecret');
      const userId = stateless.verifyToken(token);
      strictEqual(userId, null, 'Expired token should return null');
    });
  });
});