import { TokenPayload } from '../core/types';
export declare class StatelessSession {
    private readonly secret;
    constructor(secret: string);
    createToken(userUniqueIdentifier: string, expiresAt?: number): string;
    verifyToken(token: string): string | null;
    getTokenPayload(token: string): TokenPayload | null;
}
