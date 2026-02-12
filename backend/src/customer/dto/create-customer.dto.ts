import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Customer phone number (Uzbekistan format)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number must be in format +998XXXXXXXXX',
  })
  phoneNumber: string;

  @ApiPropertyOptional({
    example: 'Tashkent, Chilanzar',
    description: 'Customer address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'AA1234567',
    description: 'Passport ID',
  })
  @IsString()
  @IsOptional()
  passportId?: string;

  @ApiPropertyOptional({
    example: 'Regular customer, prefers cash payments',
    description: 'Additional notes about customer',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
