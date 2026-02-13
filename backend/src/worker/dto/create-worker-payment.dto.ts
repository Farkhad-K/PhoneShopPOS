import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsEnum, IsDateString, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/common/enums/enum';

export class CreateWorkerPaymentDto {
  @ApiProperty({ example: 1, description: 'Worker ID' })
  @IsInt()
  @Type(() => Number)
  workerId: number;

  @ApiProperty({ example: 3000000, description: 'Base salary amount' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2026-02-15', description: 'Payment date (YYYY-MM-DD)' })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 2, description: 'Month (1-12)' })
  @IsInt()
  @Type(() => Number)
  month: number;

  @ApiProperty({ example: 2026, description: 'Year' })
  @IsInt()
  @Type(() => Number)
  year: number;

  @ApiPropertyOptional({ example: 500000, description: 'Bonus amount' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  bonus?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Deduction amount (late, absent, etc.)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  deduction?: number;

  @ApiPropertyOptional({ example: 'February salary with performance bonus' })
  @IsString()
  @IsOptional()
  notes?: string;
}
