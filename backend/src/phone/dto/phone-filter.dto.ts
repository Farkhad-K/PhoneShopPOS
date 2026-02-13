import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PhoneStatus, PhoneCondition } from 'src/common/enums/enum';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

export class PhoneFilterDto extends PaginationQueryDto {
  @ApiProperty({
    enum: PhoneStatus,
    example: PhoneStatus.IN_STOCK,
    description: 'Filter by phone status',
    required: false,
  })
  @IsEnum(PhoneStatus)
  @IsOptional()
  status?: PhoneStatus;

  @ApiProperty({
    enum: PhoneCondition,
    example: PhoneCondition.NEW,
    description: 'Filter by phone condition',
    required: false,
  })
  @IsEnum(PhoneCondition)
  @IsOptional()
  condition?: PhoneCondition;

  @ApiProperty({
    example: 'Apple',
    description: 'Filter by brand (partial match)',
    required: false,
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    example: 'iPhone 15',
    description: 'Filter by model (partial match)',
    required: false,
  })
  @IsString()
  @IsOptional()
  model?: string;
}
