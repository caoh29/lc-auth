"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const stateful_1 = require("./strategies/stateful");
const stateless_1 = require("./strategies/stateless");
const local_1 = require("./strategies/local");
const oauth_1 = require("./strategies/oauth");
class Auth {
    constructor(config) {
        // Validate config
        if (config.strategy === 'stateless' && !config.jwtSecret) {
            throw new Error('jwtSecret is required for stateless strategy');
        }
        if (config.strategy === 'stateful' && !config.database) {
            throw new Error('database is required for stateful strategy');
        }
        if (config.database)
            this.local = new local_1.LocalAuth(config.database);
        if (config.strategy === 'stateful' && config.database) {
            this.session = new stateful_1.StatefulSession(config.database);
        }
        else if (config.strategy === 'stateless' && config.jwtSecret) {
            this.session = new stateless_1.StatelessSession(config.jwtSecret);
        }
        else {
            throw new Error('Invalid config');
        }
        // Initialize OAuth if provided
        if (config.oauth)
            this.oauth = new oauth_1.OAuth(config.oauth);
    }
    async register(username, password) {
        if (!this.local)
            throw new Error('Local auth is not configured');
        return this.local.register(username, password);
    }
    async login(username, password) {
        if (!this.local)
            throw new Error('Local auth is not configured');
        return this.local.login(username, password);
    }
    getOAuthUrl(state, codeChallenge) {
        if (!this.oauth)
            throw new Error('OAuth is not configured');
        return this.oauth.getAuthUrl(state, codeChallenge);
    }
    async exchangeOAuthCode(code, codeVerifier) {
        if (!this.oauth)
            throw new Error('OAuth is not configured');
        return await this.oauth.exchangeCode(code, codeVerifier);
    }
    async refreshOAuthToken(refreshToken) {
        if (!this.oauth)
            throw new Error('OAuth is not configured');
        return await this.oauth.refreshAccessToken(refreshToken);
    }
    // It will return either a session id or a token
    async createSession(userId, expiresAt) {
        if (this.session instanceof stateful_1.StatefulSession) {
            return this.session.createSession(userId, expiresAt);
        }
        else if (this.session instanceof stateless_1.StatelessSession) {
            return this.session.createToken(userId, expiresAt);
        }
        else {
            throw new Error('Invalid session type');
        }
    }
    // It will return a userId if session or token is still valid, otherwise null
    async verifySession(sessionIdOrToken) {
        if (this.session instanceof stateful_1.StatefulSession) {
            return this.session.verifySession(sessionIdOrToken);
        }
        else if (this.session instanceof stateless_1.StatelessSession) {
            return this.session.verifyToken(sessionIdOrToken);
        }
        else {
            throw new Error('Invalid session type');
        }
    }
    // It will return the session only if the session is stateful
    async getSession(sessionIdOrToken) {
        if (this.session instanceof stateful_1.StatefulSession) {
            return this.session.getSession(sessionIdOrToken);
        }
        else {
            throw new Error('Not supported');
        }
    }
    // It will delete the session only if the session is stateful
    async deleteSession(sessionIdOrToken) {
        if (this.session instanceof stateful_1.StatefulSession) {
            return this.session.deleteSession(sessionIdOrToken);
        }
        else {
            throw new Error('Not supported');
        }
    }
    ;
}
exports.Auth = Auth;
exports.default = Auth;
