import { Database } from '../core/types';
export declare class StatefulSession {
    private readonly db;
    constructor(db: Database);
    createSession(userId: string): Promise<string>;
    verifySession(sessionId: string): Promise<string | null>;
    deleteSession(sessionId: string): Promise<void>;
}
