import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { RefreshPayload, tokenVersionMatches } from '../helper';
import { AuthBaseService } from './auth-base.service';
import { AuthSigningService } from './auth-signing.service';

@Injectable()
export class AuthRefreshService extends AuthBaseService {
  constructor(
    // inject actual deps instead of another AuthBaseService instance
    jwt: JwtService,
    config: ConfigService,
    @InjectRepository(User) usersRepo: Repository<User>,
    private readonly signing: AuthSigningService,
  ) {
    super(jwt, config, usersRepo);
  }

  async refresh(refreshToken: string): Promise<{
    user: User;
    tokens: { access_token: string; refresh_token: string };
  }> {
    if (!refreshToken) throw new BadRequestException('refresh_token majburiy');

    let payload: RefreshPayload;
    try {
      payload = await this.signing.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token noto‘g‘ri');
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi yoki faol emas');
    }

    if (!tokenVersionMatches(payload.tokenVersion, user.refreshTokenVersion)) {
      throw new UnauthorizedException('Refresh token noto‘g‘ri');
    }

    const tokens = await this.signing.signTokens(user);
    return { user, tokens };
  }
}
