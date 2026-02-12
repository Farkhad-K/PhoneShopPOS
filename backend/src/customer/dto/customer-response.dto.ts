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

  @ApiProperty({ example: 500.0, description: 'Total debt (unpaid sales)' })
  totalDebt: number;

  @ApiProperty({ example: 200.0, description: 'Total credit (unpaid purchases)' })
  totalCredit: number;

  @ApiProperty({ example: 300.0, description: 'Net balance (debt - credit)' })
  netBalance: number;
}
