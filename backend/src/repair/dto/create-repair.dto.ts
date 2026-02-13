import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsPositive,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { RepairStatus } from 'src/common/enums/enum';

export class CreateRepairDto {
  @ApiProperty({ example: 1, description: 'Phone ID to repair' })
  @IsNumber()
  @IsPositive()
  phoneId: number;

  @ApiProperty({
    example: 'Replace cracked screen and battery',
    description: 'Detailed description of repair work',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 150.5, description: 'Cost of repair' })
  @IsNumber()
  @IsPositive()
  repairCost: number;

  @ApiProperty({
    enum: RepairStatus,
    example: RepairStatus.PENDING,
    description: 'Initial repair status',
    default: RepairStatus.PENDING,
  })
  @IsEnum(RepairStatus)
  @IsOptional()
  status?: RepairStatus;

  @ApiProperty({
    example: '2026-02-13T10:00:00Z',
    description: 'When repair started or will start',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: 'Customer requested screen protector as well',
    description: 'Additional notes about the repair',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
