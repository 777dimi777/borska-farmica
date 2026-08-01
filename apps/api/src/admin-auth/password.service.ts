import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
@Injectable()
export class PasswordService {
  private readonly dummyHash = argon2.hash(randomBytes(32), {
    type: argon2.argon2id,
  });
  hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });
  }
  verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
  async verifyDummy(password: string): Promise<void> {
    await argon2.verify(await this.dummyHash, password);
  }
}
