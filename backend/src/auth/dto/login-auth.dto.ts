import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username',
  })
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Password' })
  password: string;
}
