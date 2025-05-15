import { TokenPayload } from './types';
export declare function hashPassword(password: string): string;
export declare function verifyPassword(stored: string, supplied: string): boolean;
export declare function signJWT(payload: TokenPayload, secret: string): string;
export declare function verifyJWT(token: string, secret: string): TokenPayload | null;
export declare function generateCodeVerifier(): string;
export declare function generateCodeChallenge(codeVerifier: string): string;
