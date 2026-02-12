import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsString()
  @IsOptional()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number must be in format +998XXXXXXXXX',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Tashkent, Chilanzar' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'AA1234567' })
  @IsString()
  @IsOptional()
  passportId?: string;

  @ApiPropertyOptional({ example: 'Regular customer' })
  @IsString()
  @IsOptional()
  notes?: string;
}
