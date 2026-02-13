import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from 'src/common/enums/enum';

/**
 * DTO for applying payment using FIFO algorithm
 * This will automatically distribute payment across oldest unpaid transactions
 */
export class ApplyPaymentDto {
  @ApiProperty({
    description: 'Payment amount to apply',
    example: 1000.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Payment amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Optional notes about the payment',
    example: 'Monthly payment installment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
