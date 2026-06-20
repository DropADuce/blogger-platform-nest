import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private SALT_LEVEL_FALLBACK: number = 10;

  comparePassword(params: { password: string; hash: string }) {
    return bcrypt.compare(params.password, params.hash);
  }

  async createPassword(config: { password: string; saltLevel?: number }) {
    const salt = await bcrypt.genSalt(
      config.saltLevel ?? this.SALT_LEVEL_FALLBACK,
    );

    return await bcrypt.hash(config.password, salt);
  }
}
