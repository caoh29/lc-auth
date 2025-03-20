"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatelessSession = void 0;
const crypto_1 = require("../core/crypto");
class StatelessSession {
    constructor(secret) {
        this.secret = secret;
    }
    createToken(userId) {
        return (0, crypto_1.signJWT)({ userId, expires: Math.floor(Date.now() / 1000) + 3600 }, this.secret);
    }
    verifyToken(token) {
        const payload = (0, crypto_1.verifyJWT)(token, this.secret);
        if (payload && payload.expires > Math.floor(Date.now() / 1000)) {
            return payload.userId;
        }
        return null;
    }
}
exports.StatelessSession = StatelessSession;
