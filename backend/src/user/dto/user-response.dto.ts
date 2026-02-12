// dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/enum';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
