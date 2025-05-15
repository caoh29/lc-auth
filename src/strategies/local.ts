import { hashPassword, verifyPassword } from '../core/crypto';
import { User, Database } from '../core/types';

export class LocalAuth {
  constructor(private readonly db: Database) { }

  async register(username: string, password: string): Promise<User> {
    if (!this.db.createUser) throw new Error('createUser is not implemented');
    const passwordHash = hashPassword(password);
    const user: User = { username, passwordHash };
    const createdUser = await this.db.createUser(user);
    if (!createdUser) throw new Error('Failed to create user');
    return createdUser;
  }

  async login(username: string, password: string): Promise<User | null> {
    if (!this.db.findUserByUniqueField) throw new Error('findUserByUniqueField is not implemented');
    const user = await this.db.findUserByUniqueField(username);
    if (user?.passwordHash && verifyPassword(user.passwordHash, password)) {
      return user;
    }
    return null;
  }
}