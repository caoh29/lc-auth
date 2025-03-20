"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAuth = void 0;
const crypto_1 = require("crypto");
const crypto_2 = require("../core/crypto");
class LocalAuth {
    constructor(db) {
        this.db = db;
    }
    async register(username, password) {
        const passwordHash = (0, crypto_2.hashPassword)(password);
        const user = { id: (0, crypto_1.randomBytes)(8).toString('hex'), username, passwordHash };
        await this.db.createUser(user);
        return user;
    }
    async login(username, password) {
        const user = await this.db.findUserByUsername(username);
        if ((user === null || user === void 0 ? void 0 : user.passwordHash) && (0, crypto_2.verifyPassword)(user.passwordHash, password)) {
            return user;
        }
        return null;
    }
}
exports.LocalAuth = LocalAuth;
