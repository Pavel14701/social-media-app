import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { IPasswordAdapter } from '../../application/interfaces/password-adapter.interface';

@Injectable()
export class PasswordAdapter implements IPasswordAdapter {
  private readonly options: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  };

  async hash(plain: string): Promise<string> {
    if (!plain || plain.length < 6) {
      throw new Error('Password too short');
    }
    return argon2.hash(plain, this.options);
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    if (!hash || !plain) return false;
    return argon2.verify(hash, plain, this.options).catch(() => false);
  }
}
