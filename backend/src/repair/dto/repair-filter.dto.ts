import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsInt,
  IsPositive,
  IsDateString,
  IsString,
} from 'class-validator';
import { RepairStatus } from 'src/common/enums/enum';

export class RepairFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (default: 10)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  take?: number = 10;

  @ApiPropertyOptional({
    example: 'startDate',
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order (ASC or DESC)',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    example: 'screen',
    description: 'Search by phone brand/model or repair description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by phone ID',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  phoneId?: number;

  @ApiPropertyOptional({
    enum: RepairStatus,
    example: RepairStatus.PENDING,
    description: 'Filter by repair status',
  })
  @IsOptional()
  @IsEnum(RepairStatus)
  status?: RepairStatus;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'Filter repairs from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-28',
    description: 'Filter repairs to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Minimum repair cost',
  })
  @Type(() => Number)
  @IsOptional()
  minCost?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum repair cost',
  })
  @Type(() => Number)
  @IsOptional()
  maxCost?: number;
}
