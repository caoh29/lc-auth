export declare class StatelessSession {
    private readonly secret;
    constructor(secret: string);
    createToken(userId: string): string;
    verifyToken(token: string): string | null;
}
