import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PhoneStatus, PhoneCondition } from 'src/common/enums/enum';

export class UpdatePhoneDto {
  @ApiProperty({
    enum: PhoneStatus,
    example: PhoneStatus.IN_STOCK,
    description: 'Update phone status manually (use with caution)',
    required: false,
  })
  @IsEnum(PhoneStatus)
  @IsOptional()
  status?: PhoneStatus;

  @ApiProperty({
    enum: PhoneCondition,
    example: PhoneCondition.GOOD,
    description: 'Update phone condition',
    required: false,
  })
  @IsEnum(PhoneCondition)
  @IsOptional()
  condition?: PhoneCondition;

  @ApiProperty({
    example: 'Updated notes about phone condition',
    description: 'Update notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
