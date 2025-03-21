"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLibrary = void 0;
const local_1 = require("./strategies/local");
const oauth_1 = require("./strategies/oauth");
const stateful_1 = require("./strategies/stateful");
const stateless_1 = require("./strategies/stateless");
class AuthLibrary {
    constructor(config) {
        // Bind methods
        this.register = () => this.local.register.bind(this.local);
        this.login = () => this.local.login.bind(this.local);
        this.getOAuthUrl = () => { var _a; return (_a = this.oauth) === null || _a === void 0 ? void 0 : _a.getAuthUrl.bind(this.oauth); };
        this.exchangeOAuthCode = () => { var _a; return (_a = this.oauth) === null || _a === void 0 ? void 0 : _a.exchangeCode.bind(this.oauth); };
        this.createSession = (userId) => this.session instanceof stateful_1.StatefulSession
            ? this.session.createSession(userId)
            : this.session.createToken(userId);
        this.verifySession = (sessionIdOrToken) => this.session instanceof stateful_1.StatefulSession
            ? this.session.verifySession(sessionIdOrToken)
            : this.session.verifyToken(sessionIdOrToken);
        this.deleteSession = (sessionIdOrToken) => {
            if (this.session instanceof stateful_1.StatefulSession) {
                return this.session.deleteSession(sessionIdOrToken);
            }
            else {
                throw new Error('Not supported');
            }
        };
        // Validate config
        if (config.strategy === 'stateless' && !config.jwtSecret) {
            throw new Error('jwtSecret is required for stateless strategy');
        }
        if (!config.database) {
            throw new Error('database is required');
        }
        if (config.strategy === 'stateful') {
            this.session = new stateful_1.StatefulSession(config.database);
        }
        else if (config.strategy === 'stateless' && config.jwtSecret) {
            this.session = new stateless_1.StatelessSession(config.jwtSecret);
        }
        else {
            throw new Error('Invalid config');
        }
        this.local = new local_1.LocalAuth(config.database);
        // Initialize OAuth if provided
        if (config.oauth)
            this.oauth = new oauth_1.OAuth(config.oauth);
    }
}
exports.AuthLibrary = AuthLibrary;
exports.default = AuthLibrary;
