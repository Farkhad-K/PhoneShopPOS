import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentType } from 'src/common/enums/enum';

export class SaleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  phoneId: number;

  @ApiProperty({ example: 1, nullable: true })
  customerId: number;

  @ApiProperty({ example: 1200 })
  salePrice: number;

  @ApiProperty({ example: '2026-02-13T10:00:00Z' })
  saleDate: Date;

  @ApiProperty({ enum: PaymentType, example: PaymentType.CASH })
  paymentType: PaymentType;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 1200 })
  paidAmount: number;

  @ApiProperty({ example: 0 })
  remainingAmount: number;

  @ApiProperty({ example: 250.5, description: 'Profit = salePrice - phone.totalCost' })
  profit: number;

  @ApiProperty({ example: 'Customer happy', nullable: true })
  notes: string;

  @ApiProperty({ example: '2026-02-13T09:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-13T10:05:00Z' })
  updatedAt: Date;
}
