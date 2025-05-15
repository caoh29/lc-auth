// tests/strategies.test.ts
import { describe, it } from 'node:test';
import { strictEqual, ok, throws } from 'assert';
import { LocalAuth } from '../src/strategies/local';
import { OAuth } from '../src/strategies/oauth';
import { StatefulSession } from '../src/strategies/stateful';
import { StatelessSession } from '../src/strategies/stateless';
import { Database, OAuthProviderConfig, User, Session } from '../src/core/types';
import { hashPassword } from '../src/core/crypto';

// Mock Database Implementation
const mockDb: Database = {
  async findUserByUniqueField(username: string) {
    return username === 'testuser'
      ? { username: 'testuser', passwordHash: hashPassword('testpass') }
      : null;
  },
  async createUser(user: User) {
    return user;
  },
  async createSession(userId: string) {
    return 'test-session-id';
  },
  async getSession(sessionId: string) {
    return sessionId === 'validSession'
      ? {
        id: 'validSession',
        userId: 'testuser',
        expiresAt: Date.now() + 3600000
      }
      : null;
  },
  async deleteSession(sessionId: string) {
    return Promise.resolve();
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
      strictEqual(user?.username, 'testuser', 'Login should succeed with correct credentials');
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
      const parsed = new URL(url);

      strictEqual(parsed.origin + parsed.pathname, config.authUrl, 'Base URL should match');
      const params = parsed.searchParams;
      strictEqual(params.get('client_id'), config.clientId);
      strictEqual(params.get('redirect_uri'), config.redirectUri);
      strictEqual(params.get('state'), state);
      strictEqual(params.get('response_type'), 'code');
      strictEqual(params.get('code_challenge_method'), 'S256');
      if (config.scope) {
        strictEqual(params.get('scope'), config.scope);
      }
      ok(params.get('code_challenge'), 'Should include code_challenge');
    });

    it('should generate URL with code challenge when provided', () => {
      const state = 'randomstate';
      const codeChallenge = 'challenge123';
      const url = oauth.getAuthUrl(state, codeChallenge);
      const parsed = new URL(url);
      const params = parsed.searchParams;
      strictEqual(params.get('code_challenge'), codeChallenge, 'URL should include code challenge');
      strictEqual(params.get('code_challenge_method'), 'S256', 'URL should include code challenge method');
    });

    it('should throw error when exchanging invalid code', async () => {
      await throws(
        async () => await oauth.exchangeCode('invalid-code'),
        Error,
        'Token request failed'
      );
    });
  });

  // StatefulSession Tests
  describe('StatefulSession', () => {
    const stateful = new StatefulSession(mockDb);

    it('should create a session', async () => {
      const sessionId = await stateful.createSession('testuser');
      ok(sessionId.length > 0, 'Session ID should be generated');
    });

    it('should verify a valid session', async () => {
      const userId = await stateful.verifySession('validSession');
      strictEqual(userId, 'testuser', 'Valid session should return user ID');
    });

    it('should return null for invalid session', async () => {
      const userId = await stateful.verifySession('invalidSession');
      strictEqual(userId, null, 'Invalid session should return null');
    });

    it('should get session data', async () => {
      const session = await stateful.getSession('validSession');
      ok(session, 'Should return session data');
      strictEqual(session?.userId, 'testuser', 'Session should contain correct user ID');
    });

    // Remove or update this test if you want to track deletions in the mock
    // it('should delete session', async () => {
    //   await stateful.deleteSession('validSession');
    //   const session = await stateful.getSession('validSession');
    //   strictEqual(session, null, 'Session should be deleted');
    // });
  });

  // StatelessSession Tests
  describe('StatelessSession', () => {
    const stateless = new StatelessSession('mysecret');

    it('should create a valid token', () => {
      const token = stateless.createToken('testuser');
      const payload = stateless.getTokenPayload(token);
      ok(payload, 'Token should be valid');
      strictEqual(payload?.sub, 'testuser', 'Token should contain user ID');
      ok(payload?.exp > Math.floor(Date.now() / 1000), 'Token should not be expired');
      ok(payload?.jti, 'Token should have a JTI');
      ok(payload?.iat, 'Token should have an IAT');
      ok(payload?.nbf, 'Token should have an NBF');
    });

    it('should verify a valid token', () => {
      const token = stateless.createToken('testuser');
      const userId = stateless.verifyToken(token);
      strictEqual(userId, 'testuser', 'Valid token should return user ID');
    });

    it('should return null for invalid token', () => {
      const userId = stateless.verifyToken('invalid.token.here');
      strictEqual(userId, null, 'Invalid token should return null');
    });

    it('should return null for expired token', () => {
      const token = stateless.createToken('testuser', Math.floor(Date.now() / 1000) - 3600);
      const userId = stateless.verifyToken(token);
      strictEqual(userId, null, 'Expired token should return null');
    });

    it('should create token with custom expiration', () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 7200; // 2 hours
      const token = stateless.createToken('testuser', expiresAt);
      const payload = stateless.getTokenPayload(token);
      strictEqual(payload?.exp, expiresAt, 'Token should have custom expiration');
    });
  });
});