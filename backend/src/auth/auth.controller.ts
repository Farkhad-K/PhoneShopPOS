// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshAuthDto } from './dto/refresh-auth.dto';
import { AuthService } from './services/auth.service';

function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Post('login')
  @ApiBody({ type: LoginAuthDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() dto: LoginAuthDto): Promise<AuthResponseDto> {
    const user = await this.auth.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Login yoki parol noto‘g‘ri');

    const tokens = await this.auth.login(user);
    return { user: toUserResponse(user), auth: tokens };
  }

  @Public()
  @Post('refresh')
  @ApiBody({ type: RefreshAuthDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(@Body() dto: RefreshAuthDto): Promise<AuthResponseDto> {
    const { user, tokens } = await this.auth.refresh(dto.refresh_token);
    return { user: toUserResponse(user), auth: tokens };
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Invalidate current refresh token version' })
  async logout(@CurrentUser() user: User) {
    return this.auth.logout(user);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: AuthResponseDto })
  async me(
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<AuthResponseDto> {
    const rawAuth = (headers['authorization'] ??
      headers['Authorization'] ??
      headers['AUTHORIZATION']) as string | undefined;

    const xToken = (headers['x-access-token'] ??
      headers['X-Access-Token'] ??
      headers['xAccessToken']) as string | undefined;

    const fromAuthHeader =
      typeof rawAuth === 'string' && rawAuth.trim().length > 0
        ? rawAuth.trim()
        : undefined;

    const headerToken =
      typeof xToken === 'string' && xToken.trim().length > 0
        ? xToken.trim()
        : undefined;

    if (!fromAuthHeader && !headerToken) {
      throw new UnauthorizedException('Sarlavhalarda token topilmadi');
    }

    const tokenSource = fromAuthHeader ?? headerToken!;
    const parts = tokenSource.split(/\s+/);
    const token = parts.length === 1 ? parts[0] : parts[parts.length - 1];

    if (!token) throw new UnauthorizedException('Sarlavhada token bo‘sh');

    return this.auth.meFromToken(token);
  }
}
