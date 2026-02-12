import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthBaseService {
  private readonly _accessSecret: string;
  private readonly _refreshSecret: string;

  constructor(
    protected readonly jwt: JwtService,
    protected readonly config: ConfigService,
    @InjectRepository(User) protected readonly usersRepo: Repository<User>,
  ) {
    this._accessSecret = this.requireSecret('JWT_SECRET');
    this._refreshSecret = this.requireSecret('JWT_REFRESH_SECRET');
  }

  protected get accessSecret(): string {
    return this._accessSecret;
  }

  protected get refreshSecret(): string {
    return this._refreshSecret;
  }

  protected get accessExpires(): string {
    return this.config.get<string>('JWT_EXPIRES') || '15m';
  }

  protected get refreshExpires(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d';
  }

  private requireSecret(key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
    const value = this.config.get<string>(key, { infer: true });
    if (!value) {
      throw new Error(`[AUTH] Environment variable ${key} is required`);
    }
    return value;
  }

  protected async incrementRefreshTokenVersion(userId: number): Promise<void> {
    await this.usersRepo.increment(
      { id: userId, isActive: true },
      'refreshTokenVersion',
      1,
    );
  }
}
