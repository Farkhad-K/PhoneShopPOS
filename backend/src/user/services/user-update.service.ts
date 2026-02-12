// src/user/services/user-update.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UserBaseService } from './user-base.service';

@Injectable()
export class UserUpdateService extends UserBaseService {
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getActiveUserOrThrow(id);

    // 🔒 verify old password
    const ok = await this.comparePassword(dto.oldPassword, user.password);
    if (!ok) throw new UnauthorizedException('Eski parol noto‘g‘ri');

    if (dto.username && dto.username !== user.username) {
      await this.ensureUsernameUnique(dto.username, id);
      user.username = dto.username;
    }

    if (dto.password) {
      user.password = await this.hashPassword(dto.password);
    }

    if (dto.role) {
      user.role = dto.role;
    }

    return this.usersRepository.save(user);
  }
}
