import { Database, User, Session, OAuthProviderConfig, OAuthTokenResponse } from './core/types';
export interface AuthConfig {
    strategy: 'stateful' | 'stateless';
    database?: Database;
    jwtSecret?: string;
    oauth?: OAuthProviderConfig;
}
export declare class Auth {
    private readonly local?;
    private readonly oauth?;
    private readonly session;
    constructor(config: AuthConfig);
    register(username: string, password: string): Promise<User>;
    login(username: string, password: string): Promise<User | null>;
    getOAuthUrl(state: string, codeChallenge?: string): string;
    exchangeOAuthCode(code: string, codeVerifier?: string): Promise<OAuthTokenResponse>;
    refreshOAuthToken(refreshToken: string): Promise<OAuthTokenResponse>;
    createSession(userId: string, expiresAt?: number): Promise<string>;
    verifySession(sessionIdOrToken: string): Promise<string | null>;
    getSession(sessionIdOrToken: string): Promise<Session | null>;
    deleteSession(sessionIdOrToken: string): Promise<void>;
}
export default Auth;
