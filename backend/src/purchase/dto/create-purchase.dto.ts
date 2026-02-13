import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, PhoneCondition, PhoneStatus } from 'src/common/enums/enum';

export class PurchasePhoneDto {
  @ApiProperty({ example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ example: '123456789012345' })
  @IsString()
  @IsOptional()
  imei?: string;

  @ApiPropertyOptional({ example: 'Midnight Black' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ enum: PhoneCondition, example: PhoneCondition.NEW })
  @IsEnum(PhoneCondition)
  condition: PhoneCondition;

  @ApiProperty({ example: 5000000, description: 'Purchase price in UZS' })
  @IsNumber()
  @IsPositive()
  purchasePrice: number;

  @ApiProperty({ enum: PhoneStatus, example: PhoneStatus.IN_STOCK })
  @IsEnum(PhoneStatus)
  status: PhoneStatus;

  @ApiPropertyOptional({ example: 'Minor scratches on back' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 1, description: 'Supplier ID' })
  @IsNumber()
  @IsPositive()
  supplierId: number;

  @ApiProperty({ type: [PurchasePhoneDto], description: 'List of phones being purchased' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchasePhoneDto)
  phones: PurchasePhoneDto[];

  @ApiPropertyOptional({ example: '2026-02-13T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PARTIAL })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ example: 3000000, description: 'Amount paid upfront' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 'Bulk purchase with 10% discount' })
  @IsString()
  @IsOptional()
  notes?: string;
}
