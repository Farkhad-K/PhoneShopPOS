import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TechnoMart LLC' })
  companyName: string;

  @ApiPropertyOptional({ example: 'John Smith' })
  contactPerson?: string;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'supplier@technomart.uz' })
  email?: string;

  @ApiPropertyOptional({ example: 'Tashkent, Sergeli district' })
  address?: string;

  @ApiPropertyOptional({ example: 'Wholesale supplier' })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class SupplierBalanceDto {
  @ApiProperty({ example: 1 })
  supplierId: number;

  @ApiProperty({ example: 'TechnoMart LLC' })
  supplierName: string;

  @ApiProperty({ example: 800.0, description: 'Total credit owed to supplier (unpaid purchases)' })
  totalCredit: number;

  @ApiProperty({
    description: 'List of unpaid and partially paid purchases',
    example: [{
      id: 2,
      totalAmount: 2800,
      paidAmount: 2000,
      remainingBalance: 800,
      purchaseDate: '2026-02-09T09:56:22.911Z',
      notes: 'Samsung bulk order'
    }]
  })
  unpaidPurchases: {
    id: number;
    totalAmount: number;
    paidAmount: number;
    remainingBalance: number;
    purchaseDate: Date;
    notes: string;
  }[];
}
