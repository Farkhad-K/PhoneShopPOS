import { ApiProperty } from '@nestjs/swagger';

export class RefreshAuthDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token',
  })
  refresh_token: string;
}
