// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from 'src/user/user.module';
import { User } from '../user/entities/user.entity';

import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

// Facade
import { AuthService } from './services/auth.service';

// Sub-services
import { AuthBaseService } from './services/auth-base.service';
import { AuthRefreshService } from './services/auth-refresh.service';
import { AuthSigningService } from './services/auth-signing.service';
import { AuthValidateService } from './services/auth-validate.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    // Facade
    AuthService,
    JwtStrategy,

    // Sub-services
    AuthBaseService,
    AuthRefreshService,
    AuthSigningService,
    AuthValidateService,
  ],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
