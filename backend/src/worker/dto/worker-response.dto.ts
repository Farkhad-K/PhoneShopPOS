import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ali Karimov' })
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'Tashkent, Yunusabad 5' })
  address?: string;

  @ApiProperty({ example: 'AA1234567' })
  passportId: string;

  @ApiProperty()
  hireDate: Date;

  @ApiPropertyOptional()
  terminationDate?: Date;

  @ApiProperty({ example: 3000000 })
  monthlySalary: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WorkerPaymentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  workerId: number;

  @ApiProperty({ example: 3000000 })
  amount: number;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty({ example: 'BANK_TRANSFER' })
  paymentMethod: string;

  @ApiProperty({ example: 2 })
  month: number;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 500000 })
  bonus: number;

  @ApiProperty({ example: 100000 })
  deduction: number;

  @ApiProperty({ example: 3400000, description: 'amount + bonus - deduction' })
  totalPaid: number;

  @ApiPropertyOptional({ example: 'February salary with bonus' })
  notes?: string;

  @ApiProperty()
  createdAt: Date;
}

export class WorkerSalaryHistoryDto {
  @ApiProperty({ example: 1 })
  workerId: number;

  @ApiProperty({ example: 'Ali Karimov' })
  workerName: string;

  @ApiProperty({ example: 3000000 })
  monthlySalary: number;

  @ApiProperty({ example: 12000000, description: 'Total paid in the period' })
  totalPaid: number;

  @ApiProperty({ example: 2000000, description: 'Total bonuses' })
  totalBonus: number;

  @ApiProperty({ example: 500000, description: 'Total deductions' })
  totalDeduction: number;

  @ApiProperty({ example: 4, description: 'Number of payments' })
  paymentCount: number;

  @ApiProperty({
    description: 'List of payments',
    type: [WorkerPaymentResponseDto],
  })
  payments: WorkerPaymentResponseDto[];
}
