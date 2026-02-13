// dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/enum';

export class CreateUserDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(5, { message: 'Parol kamida 5 ta belgidan iborat bo‘lishi kerak' })
  @Matches(/[A-Za-z]/, {
    message: 'Parolda kamida bitta harf bo‘lishi shart',
  })
  password: string;

  @ApiProperty({ enum: Role, example: Role.OWNER })
  @IsEnum(Role, { message: "Rol OWNER, MANAGER, CASHIER yoki TECHNICIAN bo'lishi mumkin" })
  role: Role;
}
