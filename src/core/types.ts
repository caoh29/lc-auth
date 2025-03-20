export interface User {
  id: string;
  username: string;
  passwordHash?: string; // Optional for OAuth users
}

export interface Database {
  findUserByUsername(username: string): Promise<User | null>;
  findUserById(userId: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  saveSession(sessionId: string, data: Session): Promise<void>;
  getSession(sessionId: string): Promise<Session | null>;
  deleteSession(sessionId: string): Promise<void>;
}

export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export interface Session {
  userId: string;
  expires: number;
}