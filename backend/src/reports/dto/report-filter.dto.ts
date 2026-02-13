import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFilterDto {
  @ApiPropertyOptional({
    example: '2026-02-01',
    description: 'Start date for report (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-02-28',
    description: 'End date for report (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by supplier ID',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  supplierId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by customer ID',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  customerId?: number;
}
