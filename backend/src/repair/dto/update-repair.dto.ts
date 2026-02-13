import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { RepairStatus } from 'src/common/enums/enum';
import { CreateRepairDto } from './create-repair.dto';

export class UpdateRepairDto extends PartialType(CreateRepairDto) {
  @ApiProperty({
    enum: RepairStatus,
    example: RepairStatus.COMPLETED,
    description: 'Update repair status',
    required: false,
  })
  @IsEnum(RepairStatus)
  @IsOptional()
  status?: RepairStatus;

  @ApiProperty({
    example: '2026-02-15T16:00:00Z',
    description: 'When repair was completed',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @ApiProperty({
    example: 'Repair completed successfully. Tested all functions.',
    description: 'Update notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
