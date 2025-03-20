import { randomBytes } from 'crypto';
import { hashPassword, verifyPassword } from '../core/crypto';
import { User, Database } from '../core/types';

export class LocalAuth {
  constructor(private readonly db: Database) { }

  async register(username: string, password: string): Promise<User> {
    const passwordHash = hashPassword(password);
    const user: User = { id: randomBytes(8).toString('hex'), username, passwordHash };
    await this.db.createUser(user);
    return user;
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = await this.db.findUserByUsername(username);
    if (user?.passwordHash && verifyPassword(user.passwordHash, password)) {
      return user;
    }
    return null;
  }
}