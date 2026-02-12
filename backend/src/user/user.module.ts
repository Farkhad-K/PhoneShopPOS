// src/user/user.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';

// Facade
import { UserService } from './services/user.service';

// Sub-services
import { UserBaseService } from './services/user-base.service';
import { UserCreateService } from './services/user-create.service';
import { UserFindAllService } from './services/user-find-all.service';
import { UserFindByUsernameService } from './services/user-find-by-username.service';
import { UserFindOneService } from './services/user-find-one.service';
import { UserRemoveService } from './services/user-remove.service';
import { UserUpdateService } from './services/user-update.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    // Facade
    UserService,

    // Sub-services
    UserBaseService,
    UserCreateService,
    UserFindAllService,
    UserFindByUsernameService,
    UserFindOneService,
    UserRemoveService,
    UserUpdateService,
  ],
  exports: [UserService],
})
export class UserModule {}
