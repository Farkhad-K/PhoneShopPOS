// src/user/services/user-create.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UserBaseService } from './user-base.service';

@Injectable()
export class UserCreateService extends UserBaseService {
  async create(dto: CreateUserDto): Promise<User> {
    await this.ensureUsernameUnique(dto.username);

    const hash = await this.hashPassword(dto.password);
    const user = this.usersRepository.create({
      username: dto.username,
      password: hash,
      role: dto.role,
    });
    return this.usersRepository.save(user);
  }
}
