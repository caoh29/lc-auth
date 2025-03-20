import { OAuthProviderConfig } from '../core/types';
export declare class OAuth {
    private readonly config;
    constructor(config: OAuthProviderConfig);
    getAuthUrl(state: string): string;
    exchangeCode(code: string): Promise<string>;
}
