import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkerDto {
  @ApiPropertyOptional({ example: 'Ali Karimov' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Tashkent, Yunusabad 5' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Termination date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @ApiPropertyOptional({ example: 3500000, description: 'Monthly salary in UZS' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  monthlySalary?: number;

  @ApiPropertyOptional({ example: 'Promoted to senior technician' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
