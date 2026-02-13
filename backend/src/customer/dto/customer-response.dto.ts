import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'Tashkent, Chilanzar' })
  address?: string;

  @ApiPropertyOptional({ example: 'AA1234567' })
  passportId?: string;

  @ApiPropertyOptional({ example: 'Regular customer' })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CustomerBalanceDto {
  @ApiProperty({ example: 1 })
  customerId: number;

  @ApiProperty({ example: 'John Doe' })
  customerName: string;

  @ApiProperty({ example: 550.0, description: 'Total debt from all unpaid/partial sales' })
  totalDebt: number;

  @ApiProperty({
    description: 'List of unpaid and partially paid sales',
    example: [{
      id: 2,
      salePrice: 1350,
      paidAmount: 800,
      remainingBalance: 550,
      saleDate: '2026-02-12T21:56:22.911Z',
      phone: {
        brand: 'Apple',
        model: 'iPhone 14 Pro Max'
      }
    }]
  })
  unpaidSales: {
    id: number;
    salePrice: number;
    paidAmount: number;
    remainingBalance: number;
    saleDate: Date;
    phone: {
      brand: string;
      model: string;
    };
  }[];
}
