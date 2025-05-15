import { LocalAuth } from './strategies/local';
import { OAuth } from './strategies/oauth';
import { StatefulSession } from './strategies/stateful';
import { StatelessSession } from './strategies/stateless';
import { Database, OAuthProviderConfig } from './core/types';

export interface AuthConfig {
  strategy: 'stateful' | 'stateless';
  database?: Database;
  jwtSecret?: string;
  oauth?: OAuthProviderConfig;
}

export class AuthLibrary {
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

  async register(username: string, password: string) {
    if (!this.local) throw new Error('Local auth is not configured');
    return this.local.register(username, password);
  }

  async login(username: string, password: string) {
    if (!this.local) throw new Error('Local auth is not configured');
    return this.local.login(username, password);
  }

  getOAuthUrl(state: string, codeChallenge?: string) {
    if (!this.oauth) throw new Error('OAuth is not configured');
    return this.oauth.getAuthUrl(state, codeChallenge);
  }

  async getOAuthToken(code: string, codeVerifier?: string) {
    if (!this.oauth) throw new Error('OAuth is not configured');
    return await this.oauth.exchangeCode(code, codeVerifier);
  }

  async refreshOAuthToken(refreshToken: string) {
    if (!this.oauth) throw new Error('OAuth is not configured');
    return await this.oauth.refreshAccessToken(refreshToken);
  }

  async createSession(userId: string, expiresAt?: number) {
    if (this.session instanceof StatefulSession) {
      return this.session.createSession(userId, expiresAt);
    } else if (this.session instanceof StatelessSession) {
      return this.session.createToken(userId, expiresAt);
    } else {
      throw new Error('Invalid session type');
    }
  }

  async verifySession(sessionIdOrToken: string) {
    if (this.session instanceof StatefulSession) {
      return this.session.verifySession(sessionIdOrToken);
    } else if (this.session instanceof StatelessSession) {
      return this.session.verifyToken(sessionIdOrToken);
    } else {
      throw new Error('Invalid session type');
    }
  }

  async deleteSession(sessionIdOrToken: string) {
    if (this.session instanceof StatefulSession) {
      return this.session.deleteSession(sessionIdOrToken);
    } else {
      throw new Error('Not supported');
    }
  };

}

export default AuthLibrary;