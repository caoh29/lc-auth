import { User, Database } from '../core/types';
export declare class LocalAuth {
    private readonly db;
    constructor(db: Database);
    register(username: string, password: string): Promise<User>;
    login(username: string, password: string): Promise<User | null>;
}
