import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from 'src/common/enums/enum';

export class PurchasePhoneResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  barcode: string;

  @ApiProperty()
  purchasePrice: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  condition: string;
}

export class PurchaseResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  supplierId: number;

  @ApiProperty()
  supplier: {
    id: number;
    companyName: string;
    phoneNumber: string;
  };

  @ApiProperty({ type: [PurchasePhoneResponseDto] })
  phones: PurchasePhoneResponseDto[];

  @ApiProperty()
  purchaseDate: Date;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  remainingAmount: number;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
