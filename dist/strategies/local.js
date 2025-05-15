"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAuth = void 0;
const crypto_1 = require("../core/crypto");
class LocalAuth {
    constructor(db) {
        this.db = db;
    }
    async register(username, password) {
        if (!this.db.createUser)
            throw new Error('createUser is not implemented');
        const passwordHash = (0, crypto_1.hashPassword)(password);
        const user = { username, passwordHash };
        const createdUser = await this.db.createUser(user);
        if (!createdUser)
            throw new Error('Failed to create user');
        return createdUser;
    }
    async login(username, password) {
        if (!this.db.findUserByUniqueField)
            throw new Error('findUserByUniqueField is not implemented');
        const user = await this.db.findUserByUniqueField(username);
        if ((user === null || user === void 0 ? void 0 : user.passwordHash) && (0, crypto_1.verifyPassword)(user.passwordHash, password)) {
            return user;
        }
        return null;
    }
}
exports.LocalAuth = LocalAuth;
