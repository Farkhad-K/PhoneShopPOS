// src/user/services/user.service.ts  (facade)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

import { PaginationResult } from 'src/common/utils/pagination.util';
import { UserBaseService, UserView } from './user-base.service';
import { UserCreateService } from './user-create.service';
import { UserFindAllService } from './user-find-all.service';
import { UserFindByUsernameService } from './user-find-by-username.service';
import { UserFindOneService } from './user-find-one.service';
import { UserRemoveService } from './user-remove.service';
import { UserUpdateService } from './user-update.service';

@Injectable()
export class UserService extends UserBaseService {
  constructor(
    @InjectRepository(User) usersRepository: Repository<User>,
    private readonly creator: UserCreateService,
    private readonly lister: UserFindAllService,
    private readonly finderOne: UserFindOneService,
    private readonly finderByUsername: UserFindByUsernameService,
    private readonly updater: UserUpdateService,
    private readonly remover: UserRemoveService,
  ) {
    super(usersRepository);
  }

  create(dto: CreateUserDto): Promise<User> {
    return this.creator.create(dto);
  }

  findAll(query: PaginationQueryDto): Promise<PaginationResult<UserView>> {
    return this.lister.findAll(query);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.finderByUsername.findByUsername(username);
  }

  findOne(id: number): Promise<User | null> {
    return this.finderOne.findOne(id);
  }

  update(id: number, dto: UpdateUserDto): Promise<User> {
    return this.updater.update(id, dto);
  }

  remove(id: number): Promise<void> {
    return this.remover.remove(id);
  }
}
