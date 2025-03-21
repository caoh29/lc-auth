import { Database, OAuthProviderConfig } from './core/types';
export interface AuthConfig {
    strategy: 'stateful' | 'stateless';
    database: Database;
    jwtSecret?: string;
    oauth?: OAuthProviderConfig;
}
export declare class AuthLibrary {
    private readonly local;
    private readonly oauth?;
    private readonly session;
    constructor(config: AuthConfig);
    register: () => (username: string, password: string) => Promise<import("./core/types").User>;
    login: () => (username: string, password: string) => Promise<import("./core/types").User | null>;
    getOAuthUrl: () => ((state: string) => string) | undefined;
    exchangeOAuthCode: () => ((code: string) => Promise<string>) | undefined;
    createSession: (userId: string) => string | Promise<string>;
    verifySession: (sessionIdOrToken: string) => string | Promise<string | null> | null;
    deleteSession: (sessionIdOrToken: string) => Promise<void>;
}
export default AuthLibrary;
