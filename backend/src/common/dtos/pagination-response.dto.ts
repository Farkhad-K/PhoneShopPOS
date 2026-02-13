import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  take: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  totalItems: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNextPage: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: PaginationMetaDto;

  constructor(data: T[], page: number, take: number, totalItems: number) {
    this.data = data;
    const totalPages = Math.ceil(totalItems / take);
    this.meta = {
      page: Number(page),
      take: Number(take),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }
}
