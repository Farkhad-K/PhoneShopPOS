import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsInt,
} from 'class-validator';
import { PaymentMethod } from 'src/common/enums/enum';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount',
    example: 500.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Payment date',
    example: '2026-02-13T10:00:00Z',
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Optional notes about the payment',
    example: 'Partial payment for iPhone 15',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Customer ID (for customer payments)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiProperty({
    description: 'Supplier ID (for supplier payments)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  supplierId?: number;

  @ApiProperty({
    description: 'Sale ID (if payment is for specific sale)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  saleId?: number;

  @ApiProperty({
    description: 'Purchase ID (if payment is for specific purchase)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  purchaseId?: number;
}
