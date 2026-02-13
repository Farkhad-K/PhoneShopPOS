import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from 'src/common/enums/enum';

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 500.0 })
  amount: number;

  @ApiProperty({ example: '2026-02-13T10:00:00Z' })
  paymentDate: Date;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Partial payment for iPhone 15', nullable: true })
  notes: string | null;

  @ApiProperty({ example: 1, nullable: true })
  customerId: number | null;

  @ApiProperty({ example: 1, nullable: true })
  supplierId: number | null;

  @ApiProperty({ example: 1, nullable: true })
  saleId: number | null;

  @ApiProperty({ example: 1, nullable: true })
  purchaseId: number | null;

  @ApiProperty({ example: '2026-02-13T09:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-13T09:00:00Z' })
  updatedAt: Date;
}
