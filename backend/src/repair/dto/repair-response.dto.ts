import { ApiProperty } from '@nestjs/swagger';
import { RepairStatus } from 'src/common/enums/enum';

export class RepairResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  phoneId: number;

  @ApiProperty({ example: 'Replace cracked screen and battery' })
  description: string;

  @ApiProperty({ example: 150.5 })
  repairCost: number;

  @ApiProperty({ enum: RepairStatus, example: RepairStatus.COMPLETED })
  status: RepairStatus;

  @ApiProperty({ example: '2026-02-13T10:00:00Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-02-15T16:00:00Z', nullable: true })
  completionDate: Date;

  @ApiProperty({
    example: 'Repair completed successfully',
    nullable: true,
  })
  notes: string;

  @ApiProperty({ example: '2026-02-13T09:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-02-15T16:05:00Z' })
  updatedAt: Date;
}
