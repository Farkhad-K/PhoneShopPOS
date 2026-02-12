// src/user/services/user-remove.service.ts
import { Injectable } from '@nestjs/common';
import { UserBaseService } from './user-base.service';

@Injectable()
export class UserRemoveService extends UserBaseService {
  async remove(id: number): Promise<void> {
    const user = await this.getActiveUserOrThrow(id);
    user.isActive = false;
    user.deletedAt = new Date();
    await this.usersRepository.save(user);
  }
}
