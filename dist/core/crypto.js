"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signJWT = signJWT;
exports.verifyJWT = verifyJWT;
const crypto_1 = require("crypto");
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}
function verifyPassword(stored, supplied) {
    const [salt, hash] = stored.split(':');
    const suppliedHash = (0, crypto_1.scryptSync)(supplied, salt, 64).toString('hex');
    return hash === suppliedHash;
}
function signJWT(payload, secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = (0, crypto_1.createHmac)('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}
function verifyJWT(token, secret) {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    const expectedSignature = (0, crypto_1.createHmac)('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
    if (signature !== expectedSignature)
        return null;
    try {
        return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    }
    catch (_a) {
        return null;
    }
}
