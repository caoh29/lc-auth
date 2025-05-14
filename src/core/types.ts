export interface User {
  username: string;
  passwordHash?: string; // Optional for OAuth users
}

export interface Database {
  findUserByUniqueField(identifier: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  saveSession(sessionId: string, data: Session): Promise<void>;
  getSession(sessionId: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
}

export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  clientSecret?: string;
  scope?: string;
  userInfoUrl?: string;
}

export interface OAuthTokenResponse {
  token_type: string;
  access_token: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
}

export interface Session {
  sub: string;
  exp: number;
}
