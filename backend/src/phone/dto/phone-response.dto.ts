import { ApiProperty } from '@nestjs/swagger';
import { PhoneStatus, PhoneCondition } from 'src/common/enums/enum';

export class PhoneResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Apple' })
  brand: string;

  @ApiProperty({ example: 'iPhone 15 Pro' })
  model: string;

  @ApiProperty({ example: '123456789012345', nullable: true })
  imei: string;

  @ApiProperty({ example: 'Natural Titanium', nullable: true })
  color: string;

  @ApiProperty({ enum: PhoneCondition, example: PhoneCondition.NEW })
  condition: PhoneCondition;

  @ApiProperty({ example: 850 })
  purchasePrice: number;

  @ApiProperty({ enum: PhoneStatus, example: PhoneStatus.IN_STOCK })
  status: PhoneStatus;

  @ApiProperty({ example: 'PH17078308000011234' })
  barcode: string;

  @ApiProperty({ example: 950, description: 'Purchase price + repair costs' })
  totalCost: number;

  @ApiProperty({ example: 1 })
  purchaseId: number;

  @ApiProperty({ example: 'Notes about the phone', nullable: true })
  notes: string;

  @ApiProperty({ example: '2026-02-13T09:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-13T10:05:00Z' })
  updatedAt: Date;
}
