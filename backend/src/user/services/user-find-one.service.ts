// src/user/services/user-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserBaseService } from './user-base.service';

@Injectable()
export class UserFindOneService extends UserBaseService {
  async findOne(id: number): Promise<User | null> {
    // original behavior returns null when not found (not throwing)
    return this.usersRepository.findOne({ where: { id, isActive: true } });
  }
}
