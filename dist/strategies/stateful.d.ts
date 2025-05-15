import { Database, Session } from '../core/types';
export declare class StatefulSession {
    private readonly db;
    constructor(db: Database);
    createSession(userUniqueIdentifier: string, expiresAt?: number): Promise<string>;
    getSession(sessionIdOrToken: string): Promise<Session | null>;
    verifySession(sessionIdOrToken: string): Promise<string | null>;
    deleteSession(sessionIdOrToken: string): Promise<void>;
}
