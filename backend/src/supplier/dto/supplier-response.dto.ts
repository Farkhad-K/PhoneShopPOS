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
  companyName: string;

  @ApiProperty({
    example: 50000,
    description: 'Total amount shop owes to supplier (payables)',
  })
  totalPayable: number;

  @ApiProperty({
    example: 20000,
    description: 'Amount already paid to supplier',
  })
  totalPaid: number;

  @ApiProperty({
    example: 30000,
    description: 'Remaining balance shop owes',
  })
  remainingBalance: number;
}
