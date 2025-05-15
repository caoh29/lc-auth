import { StatefulSession } from './strategies/stateful';
import { StatelessSession } from './strategies/stateless';
import { LocalAuth } from './strategies/local';
import { OAuth } from './strategies/oauth';
import { Database, User, Session, OAuthProviderConfig, OAuthTokenResponse } from './core/types';

export interface AuthConfig {
  strategy: 'stateful' | 'stateless';
  database?: Database;
  jwtSecret?: string;
  oauth?: OAuthProviderConfig;
}

export class Auth {
  private readonly local?: LocalAuth;
  private readonly oauth?: OAuth;
  private readonly session: StatefulSession | StatelessSession;

  constructor(config: AuthConfig) {
    // Validate config
    if (config.strategy === 'stateless' && !config.jwtSecret) {
      throw new Error('jwtSecret is required for stateless strategy');
    }
    if (config.strategy === 'stateful' && !config.database) {
      throw new Error('database is required for stateful strategy');
    }

    if (config.database) this.local = new LocalAuth(config.database);

    if (config.strategy === 'stateful' && config.database) {
      this.session = new StatefulSession(config.database);
    } else if (config.strategy === 'stateless' && config.jwtSecret) {
      this.session = new StatelessSession(config.jwtSecret);
    } else {
      throw new Error('Invalid config');
    }

    // Initialize OAuth if provided
    if (config.oauth) this.oauth = new OAuth(config.oauth);
  }

  async register(username: string, password: string): Promise<User> {
    if (!this.local) throw new Error('Local auth is not configured');
    return this.local.register(username, password);
  }

  async login(username: string, password: string): Promise<User | null> {
    if (!this.local) throw new Error('Local auth is not configured');
    return this.local.login(username, password);
  }

  getOAuthUrl(state: string, codeChallenge?: string): string {
    if (!this.oauth) throw new Error('OAuth is not configured');
    return this.oauth.getAuthUrl(state, codeChallenge);
  }

  async exchangeOAuthCode(code: string, codeVerifier?: string): Promise<OAuthTokenResponse> {
    if (!this.oauth) throw new Error('OAuth is not configured');
    return await this.oauth.exchangeCode(code, codeVerifier);
  }

  async refreshOAuthToken(refreshToken: string): Promise<OAuthTokenResponse> {
    if (!this.oauth) throw new Error('OAuth is not configured');
    return await this.oauth.refreshAccessToken(refreshToken);
  }

  // It will return either a session id or a token
  async createSession(userId: string, expiresAt?: number): Promise<string> {
    if (this.session instanceof StatefulSession) {
      return this.session.createSession(userId, expiresAt);
    } else if (this.session instanceof StatelessSession) {
      return this.session.createToken(userId, expiresAt);
    } else {
      throw new Error('Invalid session type');
    }
  }

  // It will return a userId if session or token is still valid, otherwise null
  async verifySession(sessionIdOrToken: string): Promise<string | null> {
    if (this.session instanceof StatefulSession) {
      return this.session.verifySession(sessionIdOrToken);
    } else if (this.session instanceof StatelessSession) {
      return this.session.verifyToken(sessionIdOrToken);
    } else {
      throw new Error('Invalid session type');
    }
  }

  // It will return the session only if the session is stateful
  async getSession(sessionIdOrToken: string): Promise<Session | null> {
    if (this.session instanceof StatefulSession) {
      return this.session.getSession(sessionIdOrToken);
    } else {
      throw new Error('Not supported');
    }
  }

  // It will delete the session only if the session is stateful
  async deleteSession(sessionIdOrToken: string): Promise<void> {
    if (this.session instanceof StatefulSession) {
      return this.session.deleteSession(sessionIdOrToken);
    } else {
      throw new Error('Not supported');
    }
  };

}

export default Auth;