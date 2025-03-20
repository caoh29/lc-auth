"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLibrary = void 0;
const local_1 = require("./strategies/local");
const oauth_1 = require("./strategies/oauth");
const stateful_1 = require("./strategies/stateful");
const stateless_1 = require("./strategies/stateless");
class AuthLibrary {
    constructor(config) {
        var _a, _b;
        this.register = this.local.register.bind(this.local);
        this.login = this.local.login.bind(this.local);
        this.getOAuthUrl = (_a = this.oauth) === null || _a === void 0 ? void 0 : _a.getAuthUrl.bind(this.oauth);
        this.exchangeOAuthCode = (_b = this.oauth) === null || _b === void 0 ? void 0 : _b.exchangeCode.bind(this.oauth);
        this.createSession = (userId) => this.session instanceof stateful_1.StatefulSession
            ? this.session.createSession(userId)
            : this.session.createToken(userId);
        if (config.strategy === 'stateful' && config.database) {
            this.session = new stateful_1.StatefulSession(config.database);
            this.local = new local_1.LocalAuth(config.database);
        }
        else if (config.strategy === 'stateless' && config.jwtSecret) {
            this.session = new stateless_1.StatelessSession(config.jwtSecret);
            this.local = new local_1.LocalAuth({}); // Requires user to handle storage
        }
        else {
            throw new Error('Invalid config');
        }
        if (config.oauth)
            this.oauth = new oauth_1.OAuth(config.oauth);
    }
}
exports.AuthLibrary = AuthLibrary;
exports.default = AuthLibrary;
