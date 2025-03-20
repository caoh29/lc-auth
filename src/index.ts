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
  private readonly local!: LocalAuth;
  private readonly oauth?: OAuth;
  private readonly session: StatefulSession | StatelessSession;

  constructor(config: AuthConfig) {
    if (config.strategy === 'stateful' && config.database) {
      this.session = new StatefulSession(config.database);
      this.local = new LocalAuth(config.database);
    } else if (config.strategy === 'stateless' && config.jwtSecret) {
      this.session = new StatelessSession(config.jwtSecret);
      this.local = new LocalAuth({} as Database); // Requires user to handle storage
    } else {
      throw new Error('Invalid config');
    }
    if (config.oauth) this.oauth = new OAuth(config.oauth);
  }

  register = this.local.register.bind(this.local);
  login = this.local.login.bind(this.local);
  getOAuthUrl = this.oauth?.getAuthUrl.bind(this.oauth);
  exchangeOAuthCode = this.oauth?.exchangeCode.bind(this.oauth);
  createSession = (userId: string) => this.session instanceof StatefulSession
    ? this.session.createSession(userId)
    : this.session.createToken(userId);
  verifySession = (sessionIdOrToken: string) => this.session instanceof StatefulSession
    ? this.session.verifySession(sessionIdOrToken)
    : this.session.verifyToken(sessionIdOrToken);
}

export default AuthLibrary;