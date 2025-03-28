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

  // Bind methods
  register = () => this.local.register.bind(this.local);

  login = () => this.local.login.bind(this.local);

  getOAuthUrl = () => this.oauth?.getAuthUrl.bind(this.oauth);

  exchangeOAuthCode = () => this.oauth?.exchangeCode.bind(this.oauth);

  createSession = (userId: string) => this.session instanceof StatefulSession
    ? this.session.createSession(userId)
    : this.session.createToken(userId);

  verifySession = (sessionIdOrToken: string) => this.session instanceof StatefulSession
    ? this.session.verifySession(sessionIdOrToken)
    : this.session.verifyToken(sessionIdOrToken);

  deleteSession = (sessionIdOrToken: string) => {
    if (this.session instanceof StatefulSession) {
      return this.session.deleteSession(sessionIdOrToken);
    } else {
      throw new Error('Not supported');
    }
  };
}

export default AuthLibrary;