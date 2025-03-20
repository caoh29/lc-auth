import { Session } from './types';
export declare function hashPassword(password: string): string;
export declare function verifyPassword(stored: string, supplied: string): boolean;
export declare function signJWT(payload: Session, secret: string): string;
export declare function verifyJWT(token: string, secret: string): Session | null;
