import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  ValidateIf,
  Min,
} from 'class-validator';
import { PaymentStatus, PaymentType } from 'src/common/enums/enum';

export class CreateSaleDto {
  @ApiProperty({ example: 1, description: 'Phone ID to sell' })
  @IsNumber()
  @IsPositive()
  phoneId: number;

  @ApiProperty({
    example: 1,
    description: 'Customer ID (required for PAY_LATER sales)',
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @ValidateIf((o) => o.paymentType === PaymentType.PAY_LATER)
  customerId?: number;

  @ApiProperty({ example: 1200, description: 'Sale price' })
  @IsNumber()
  @IsPositive()
  salePrice: number;

  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.CASH,
    description: 'Payment type: CASH (full payment) or PAY_LATER (customer debt)',
    default: PaymentType.CASH,
  })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Payment status (auto-calculated based on paidAmount)',
    default: PaymentStatus.UNPAID,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    example: 1200,
    description: 'Amount paid (for CASH, should equal salePrice; for PAY_LATER, can be partial)',
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiProperty({
    example: '2026-02-13T10:00:00Z',
    description: 'Sale date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  saleDate?: string;

  @ApiProperty({
    example: 'Customer happy with condition',
    description: 'Additional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
