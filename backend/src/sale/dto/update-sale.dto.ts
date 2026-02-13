import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSaleDto {
  @ApiProperty({
    example: 600,
    description: 'Update paid amount (for making payments on PAY_LATER sales)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiProperty({
    example: 'Customer made partial payment',
    description: 'Update notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
