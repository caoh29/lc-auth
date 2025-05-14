import { LocalAuth } from './strategies/local';
import { OAuth } from './strategies/oauth';
import { StatefulSession } from './strategies/stateful';
import { StatelessSession } from './strategies/stateless';
import { Database, OAuthProviderConfig } from './core/types';

export interface AuthConfig {
  strategy: 'stateful' | 'stateless';
  database: Database;
  jwtSecret?: string;
  oauth?: OAuthProviderConfig;
}

export class AuthLibrary {
  private readonly local: LocalAuth;
  private readonly oauth?: OAuth;
  private readonly session: StatefulSession | StatelessSession;

  constructor(config: AuthConfig) {
    // Validate config
    if (config.strategy === 'stateless' && !config.jwtSecret) {
      throw new Error('jwtSecret is required for stateless strategy');
    }

    if (!config.database) {
      throw new Error('database is required');
    }

    if (config.strategy === 'stateful') {
      this.session = new StatefulSession(config.database);
    } else if (config.strategy === 'stateless' && config.jwtSecret) {
      this.session = new StatelessSession(config.jwtSecret);
    } else {
      throw new Error('Invalid config');
    }

    this.local = new LocalAuth(config.database);

    // Initialize OAuth if provided
    if (config.oauth) this.oauth = new OAuth(config.oauth);
  }

  register(username: string, password: string) {
    return this.local.register(username, password);
  }

  login(username: string, password: string) {
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

  createSession(userId: string, token?: string) {
    if (this.session instanceof StatefulSession) {
      return this.session.createSession(userId);
    } else if (this.session instanceof StatelessSession) {
      return this.session.createToken(userId);
    } else {
      throw new Error('Invalid session type');
    }
  }

  verifySession(sessionIdOrToken: string) {
    if (this.session instanceof StatefulSession) {
      return this.session.verifySession(sessionIdOrToken);
    } else if (this.session instanceof StatelessSession) {
      return this.session.verifyToken(sessionIdOrToken);
    } else {
      throw new Error('Invalid session type');
    }
  }

  deleteSession(sessionIdOrToken: string) {
    if (this.session instanceof StatefulSession) {
      return this.session.deleteSession(sessionIdOrToken);
    } else {
      throw new Error('Not supported');
    }
  };

}

export default AuthLibrary;