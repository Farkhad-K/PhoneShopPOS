// src/user/services/user-find-all.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { UserBaseService, UserView } from './user-base.service';

@Injectable()
export class UserFindAllService extends UserBaseService {
  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<UserView>> {
    return this.listActive(query);
  }
}
