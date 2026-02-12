// src/user/services/user-base.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export type UserView = Pick<
  User,
  'id' | 'username' | 'role' | 'createdAt' | 'updatedAt'
>;

const HASH_ROUNDS = 10; // single source of truth

@Injectable()
export class UserBaseService {
  constructor(
    @InjectRepository(User)
    protected readonly usersRepository: Repository<User>,
  ) {}

  protected toView(u: User): UserView {
    return {
      id: u.id,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  protected async getActiveUserOrThrow(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  protected async ensureUsernameUnique(
    username: string,
    excludeUserId?: number,
  ): Promise<void> {
    const exists = await this.usersRepository.findOne({ where: { username } });
    if (exists && exists.id !== excludeUserId) {
      throw new BadRequestException('Foydalanuvchi nomi allaqachon mavjud');
    }
  }

  protected hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, HASH_ROUNDS);
  }

  protected comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  // shared list helper (keeps pagination util in one place)
  protected async listActive(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<UserView>> {
    const page = await paginateAndFilter(this.usersRepository, query, {
      isActive: true,
    });
    return {
      ...page,
      results: page.results.map((u) => this.toView(u)),
    };
  }
}
