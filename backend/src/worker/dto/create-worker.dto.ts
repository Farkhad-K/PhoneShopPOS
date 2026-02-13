import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkerDto {
  @ApiProperty({ example: 'Ali Karimov' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Tashkent, Yunusabad 5' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'AA1234567', description: 'Passport ID (unique)' })
  @IsString()
  passportId: string;

  @ApiProperty({ example: '2026-01-01', description: 'Hire date (YYYY-MM-DD)' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ example: 3000000, description: 'Monthly salary in UZS' })
  @IsNumber()
  @Type(() => Number)
  monthlySalary: number;

  @ApiPropertyOptional({ example: 'Experienced technician' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Link to existing user account (optional)'
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  userId?: number;
}
