export interface User {
  username: string;
  passwordHash?: string; // Optional for OAuth users
}

export interface Session {
  id: string; // Session ID
  userId: string; // User unique identifier (username or user ID)
  expiresAt: number; // Expiration time
}

export interface TokenPayload {
  sub: string; // User unique identifier (username or user ID)
  exp: number; // Expiration time
  jti: string; // Token ID
  iss?: string; // Issuer
  aud?: string; // Audience
  iat?: number; // Issued at time
  nbf?: number; // Not before time
}

export interface Database {
  createSession?: (userUniqueIdentifier: string, expiresAt?: number) => Promise<string>;
  getSession?: (sessionIdOrToken: string) => Promise<Session | null>;
  deleteSession?: (sessionIdOrToken: string) => Promise<void>;
  findUserByUniqueField?: (identifier: string) => Promise<User | null>;
  createUser?: (user: User) => Promise<User>;
}

export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  clientSecret?: string;
  scope?: string;
}

export interface OAuthTokenResponse {
  token_type: string;
  access_token: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
}