import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'TechnoMart LLC',
    description: 'Supplier company name',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional({
    example: 'John Smith',
    description: 'Contact person name',
  })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Supplier phone number (Uzbekistan format)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, {
    message: 'Phone number must be in format +998XXXXXXXXX',
  })
  phoneNumber: string;

  @ApiPropertyOptional({
    example: 'supplier@technomart.uz',
    description: 'Supplier email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Tashkent, Sergeli district',
    description: 'Supplier address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'Wholesale supplier, offers bulk discounts',
    description: 'Additional notes about supplier',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
