"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulSession = void 0;
const crypto_1 = require("crypto");
class StatefulSession {
    constructor(db) {
        this.db = db;
    }
    async createSession(userId) {
        const sessionId = (0, crypto_1.randomBytes)(16).toString('hex');
        await this.db.saveSession(sessionId, { userId, expires: Date.now() + 3600000 }); // 1 hour
        return sessionId;
    }
    async verifySession(sessionId) {
        const session = await this.db.getSession(sessionId);
        if (session && session.expires > Date.now()) {
            return session.userId;
        }
        return null;
    }
    async deleteSession(sessionId) {
        await this.db.deleteSession(sessionId);
    }
}
exports.StatefulSession = StatefulSession;
