import { OAuthProviderConfig, OAuthTokenResponse } from '../core/types';
export declare class OAuth {
    private readonly config;
    private codeVerifier;
    private codeChallenge;
    constructor(config: OAuthProviderConfig);
    getAuthUrl(state: string, codeChallenge?: string): string;
    exchangeCode(code: string, codeVerifier?: string): Promise<OAuthTokenResponse>;
    refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
}
