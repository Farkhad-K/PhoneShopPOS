// src/user/services/user-find-by-username.service.ts
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserBaseService } from './user-base.service';

@Injectable()
export class UserFindByUsernameService extends UserBaseService {
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username, isActive: true },
    });
  }
}
