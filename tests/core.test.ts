// tests/core.test.ts
import { describe, it } from 'node:test';
import { strictEqual, notStrictEqual } from 'assert';
import { hashPassword, verifyPassword, signJWT, verifyJWT } from '../src/core/crypto';

describe('Core Crypto Utilities', () => {
  // Password Hashing Tests
  it('should hash and verify a password correctly', () => {
    const password = 'mypassword123';
    const hashed = hashPassword(password);
    strictEqual(verifyPassword(hashed, password), true, 'Password should verify correctly');
  });

  it('should fail verification with incorrect password', () => {
    const password = 'mypassword123';
    const hashed = hashPassword(password);
    strictEqual(verifyPassword(hashed, 'wrongpassword'), false, 'Incorrect password should not verify');
  });

  it('should generate unique hashes for the same password', () => {
    const password = 'mypassword123';
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);
    notStrictEqual(hash1, hash2, 'Hashes should differ due to unique salts');
    strictEqual(verifyPassword(hash1, password), true, 'First hash should still verify');
    strictEqual(verifyPassword(hash2, password), true, 'Second hash should still verify');
  });

  it('should handle empty password gracefully', () => {
    const hashed = hashPassword('');
    strictEqual(typeof hashed, 'string', 'Empty password should produce a string hash');
    strictEqual(verifyPassword(hashed, ''), true, 'Empty password should verify');
  });

  // JWT Tests
  it('should sign and verify a JWT correctly', () => {
    const payload = { userId: '123', expires: Date.now() + 3600 };
    const secret = 'mysecret';
    const token = signJWT(payload, secret);
    const decoded = verifyJWT(token, secret);
    strictEqual(decoded?.userId, '123', 'JWT should decode to original payload');
  });

  it('should return null for tampered JWT', () => {
    const payload = { userId: '123', expires: Date.now() + 3600 };
    const secret = 'mysecret';
    const token = signJWT(payload, secret);
    const tampered = token.split('.').slice(0, 2).join('.') + '.tampered'; // Alter signature
    const decoded = verifyJWT(tampered, secret);
    strictEqual(decoded, null, 'Tampered JWT should not verify');
  });

  it('should return null for incorrect secret', () => {
    const payload = { userId: '123', expires: Date.now() + 3600 };
    const token = signJWT(payload, 'mysecret');
    const decoded = verifyJWT(token, 'wrongsecret');
    strictEqual(decoded, null, 'JWT with wrong secret should not verify');
  });

  it('should handle malformed JWT gracefully', () => {
    const decoded = verifyJWT('not.a.token', 'mysecret');
    strictEqual(decoded, null, 'Malformed JWT should return null');
  });

  it('should include header and payload in JWT', () => {
    const payload = { userId: '123', expires: Date.now() + 3600 };
    const secret = 'mysecret';
    const token = signJWT(payload, secret);
    const [headerB64, payloadB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    const decodedPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    strictEqual(header.alg, 'HS256', 'Header should specify HS256 algorithm');
    strictEqual(decodedPayload.userId, '123', 'Payload should match input');
  });
});