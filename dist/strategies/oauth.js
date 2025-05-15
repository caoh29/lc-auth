"use strict";
// OAUTH FLOW EXPLAINED
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth = void 0;
// 1. Client side application clicks on the login button
// 2. The client side application generates a random string and send it to the server side application called the state parameter
// 3. The server side application creates the auth url for the specified provider
// In this authUrl you can include state, code_challenge and scope
// The state is used to prevent CSRF attacks and maintain application state (generated in step 2)
// The codeChallenge is the Base64-URL-encoded SHA256 hash of the codeVerifier
// The codeVerifier is a random string of 64 characters generated in the server side application
// The scope is the scope of the token (e.g. email, profile, openid)
// 4. Once the authUrl is generated in the server side application, it is sent to the client side application
// 5. The client side applicaton receives the authUrl and makes a request to the auth url (constructed in step 3)
// 6. Then the user (client side application) will redirect the provider's auth page
// 7. If the flow completes successfully, the provider will redirect the user to the redirect_uri with a code parameter and a state parameter
// 8. The user (client side application) must validate the state (it should be the same as created in step 1) sent by the provider
// 9. The user (client side application) will then make a request to the server side application with the code provided by the authorization server
// 10. The server side application will try to exchange the code for an access token by making a request to the token endpoint of the authorization server including the code and the codeVerifier
// 11. The authorization server will validate if the codeChallenge sent in step 3 matches the codeVerifier sent in step 10
// 12. If step 11 is successful, the authorization server will return an access token (and a refresh token) to the server side application
// 13. The server side application will store the access token (and the refresh token)
// 14. The server side application will return a session cookie to the client side application (this is the last step of the flow)
// 15. The client side application will store the session cookie
// 16. The client side application will use the session cookie to make requests to the protected resources through the server side application
// 17. If the session cookie expires, the client side application will be redirected to the login page
const crypto_1 = require("../core/crypto");
class OAuth {
    constructor(config) {
        this.config = config;
    }
    getAuthUrl(state, codeChallenge) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            state,
        });
        if (this.config.scope) {
            params.set('scope', this.config.scope);
        }
        if (codeChallenge) {
            params.set('code_challenge', codeChallenge);
        }
        else {
            this.codeVerifier = (0, crypto_1.generateCodeVerifier)();
            this.codeChallenge = (0, crypto_1.generateCodeChallenge)(this.codeVerifier);
            params.set('code_challenge', this.codeChallenge);
        }
        params.set('code_challenge_method', 'S256');
        return `${this.config.authUrl}?${params.toString()}`;
    }
    async exchangeCode(code, codeVerifier) {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.config.redirectUri,
            client_id: this.config.clientId,
        });
        if (this.config.clientSecret) {
            params.set('client_secret', this.config.clientSecret);
        }
        if (codeVerifier) {
            params.append('code_verifier', codeVerifier);
        }
        else {
            if (!this.codeVerifier)
                throw new Error('Code verifier is not set');
            params.append('code_verifier', this.codeVerifier);
        }
        const res = await fetch(this.config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: params.toString(),
        });
        if (!res.ok)
            throw new Error(`Token request failed: ${res.status}`);
        return await res.json();
    }
    async refreshAccessToken(refreshToken) {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.config.clientId,
        });
        if (this.config.clientSecret) {
            params.set('client_secret', this.config.clientSecret);
        }
        const res = await fetch(this.config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: params.toString(),
        });
        if (!res.ok)
            throw new Error(`Token request failed: ${res.status}`);
        return await res.json();
    }
}
exports.OAuth = OAuth;
