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
import { PaymentType, PaymentStatus } from 'src/common/enums/enum';

export class SaleFilterDto {
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
    example: 'saleDate',
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
    example: 'iPhone',
    description: 'Search by phone brand or model',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by customer ID',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({
    enum: PaymentType,
    example: PaymentType.CASH,
    description: 'Filter by payment type',
  })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Filter by payment status',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'Filter sales from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-28',
    description: 'Filter sales to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 500,
    description: 'Minimum sale price',
  })
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Maximum sale price',
  })
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;
}
