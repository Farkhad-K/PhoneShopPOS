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
import { PaymentStatus } from 'src/common/enums/enum';

export class PurchaseFilterDto {
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
    example: 'purchaseDate',
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
    description: 'Search by supplier name or notes',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by supplier ID',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  supplierId?: number;

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
    description: 'Filter purchases from this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-28',
    description: 'Filter purchases to this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Minimum total amount',
  })
  @Type(() => Number)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Maximum total amount',
  })
  @Type(() => Number)
  @IsOptional()
  maxAmount?: number;
}
