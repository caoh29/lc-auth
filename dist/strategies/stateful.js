"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatefulSession = void 0;
class StatefulSession {
    constructor(db) {
        this.db = db;
    }
    async createSession(userUniqueIdentifier, expiresAt) {
        if (!this.db.createSession) {
            throw new Error('createSession is not implemented');
        }
        return await this.db.createSession(userUniqueIdentifier, expiresAt !== null && expiresAt !== void 0 ? expiresAt : Math.floor(Date.now() / 1000) + 1800); // 30 minutes
    }
    async getSession(sessionIdOrToken) {
        if (!this.db.getSession) {
            throw new Error('getSession is not implemented');
        }
        return await this.db.getSession(sessionIdOrToken);
    }
    async verifySession(sessionIdOrToken) {
        if (!this.db.getSession) {
            throw new Error('getSession is not implemented');
        }
        const session = await this.db.getSession(sessionIdOrToken);
        if (session && session.expiresAt > Date.now()) {
            return session.userId;
        }
        return null;
    }
    async deleteSession(sessionIdOrToken) {
        if (!this.db.deleteSession) {
            throw new Error('deleteSession is not implemented');
        }
        await this.db.deleteSession(sessionIdOrToken);
    }
}
exports.StatefulSession = StatefulSession;
