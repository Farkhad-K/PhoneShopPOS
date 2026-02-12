import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 6,
    description: 'Items per page (default: 6)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  take?: number = 6;

  @ApiPropertyOptional({ example: '', description: 'Search value' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Field to search in',
  })
  @IsOptional()
  @IsString()
  searchField?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by (default: createdAt)',
  })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order (ASC or DESC, default: DESC)',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    example: '',
    description:
      'Filter createdAt from (YYYY-MM-DD, inclusive) example: 2025-09-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'createdFrom must be in YYYY-MM-DD format',
  })
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '',
    description:
      'Filter createdAt to (YYYY-MM-DD, inclusive) example: 2025-10-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'createdTo must be in YYYY-MM-DD format',
  })
  createdTo?: string;
}
