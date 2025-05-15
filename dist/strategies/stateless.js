"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessSession = void 0;
const crypto_1 = require("../core/crypto");
class StatelessSession {
    constructor(secret) {
        this.secret = secret;
    }
    createToken(userUniqueIdentifier, expiresAt) {
        return (0, crypto_1.signJWT)({
            sub: userUniqueIdentifier,
            exp: expiresAt !== null && expiresAt !== void 0 ? expiresAt : Math.floor(Date.now() / 1000) + 1800,
            jti: crypto.randomUUID(),
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000),
        }, this.secret); // 30 minutes
    }
    verifyToken(token) {
        const payload = (0, crypto_1.verifyJWT)(token, this.secret);
        if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
            return payload.sub;
        }
        return null;
    }
    getTokenPayload(token) {
        return (0, crypto_1.verifyJWT)(token, this.secret);
    }
}
exports.StatelessSession = StatelessSession;
