// dto/update-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/enum';

export class UpdateUserDto {
  @ApiProperty({ description: 'Old password (required for any update)' })
  @IsString()
  oldPassword: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @Matches(/[A-Za-z]/, {
    message: 'Parolda kamida bitta harf bo‘lishi shart',
  })
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
