import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AccessPayload, RefreshPayload, tokenVersionMatches } from '../helper';

import { AuthValidateService } from './/auth-validate.service';
import { AuthRefreshService } from './auth-refresh.service';
import { AuthSigningService } from './auth-signing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly signing: AuthSigningService,
    private readonly validator: AuthValidateService,
    private readonly refresher: AuthRefreshService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  // -- original helpers, now delegated internally --

  async validateUser(username: string, password: string) {
    return this.validator.validateUser(username, password);
  }

  async login(user: User) {
    return this.signing.signTokens(user);
  }

  async refresh(refreshToken: string) {
    // Behavior unchanged
    return this.refresher.refresh(refreshToken);
  }

  async meFromToken(token: string): Promise<AuthResponseDto> {
    if (!token) throw new BadRequestException('Token kerak');

    const payload = await this.extractPayload(token);
    const user = await this.usersRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi yoki faol emas');
    }

    if (!tokenVersionMatches(payload.tokenVersion, user.refreshTokenVersion)) {
      throw new UnauthorizedException('Kirish tokeni noto‘g‘ri');
    }

    const tokens = await this.signing.signTokens(user);
    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      auth: tokens,
    };
  }

  async logout(user: User) {
    await this.signing.bumpRefreshTokenVersion(user.id);
    return { message: 'Tizimdan chiqildi' };
  }

  private async extractPayload(
    token: string,
  ): Promise<AccessPayload | RefreshPayload> {
    try {
      return await this.signing.verifyAccess(token);
    } catch {
      try {
        return await this.signing.verifyRefresh(token);
      } catch {
        throw new UnauthorizedException('Kirish tokeni noto‘g‘ri');
      }
    }
  }
}
