import { Injectable } from '@nestjs/common';
import { AccessPayload, RefreshPayload } from '../helper';
import { AuthBaseService } from './auth-base.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthSigningService extends AuthBaseService {
  async signTokens(
    user: Pick<User, 'id' | 'username' | 'refreshTokenVersion'>,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload: AccessPayload = {
      sub: user.id,
      username: user.username,
      tokenVersion: user.refreshTokenVersion ?? 0,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpires,
      }),
      this.jwt.signAsync(payload as RefreshPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpires,
      }),
    ]);

    return { access_token, refresh_token };
  }

  async verifyAccess(token: string): Promise<AccessPayload> {
    return this.jwt.verifyAsync<AccessPayload>(token, {
      secret: this.accessSecret,
    });
  }

  async verifyRefresh(token: string): Promise<RefreshPayload> {
    return this.jwt.verifyAsync<RefreshPayload>(token, {
      secret: this.refreshSecret,
    });
  }

  /** Best-effort decode to extract `sub` when both verifications fail. */
  decodeSub(token: string): number | undefined {
    const decoded: null | number | Record<string, unknown> =
      this.jwt.decode(token);
    if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
      return undefined;
    }
    const anyDec = decoded as { sub?: unknown };
    return typeof anyDec.sub === 'number' ? anyDec.sub : undefined;
  }

  async bumpRefreshTokenVersion(userId: number): Promise<void> {
    return this.incrementRefreshTokenVersion(userId);
  }
}
