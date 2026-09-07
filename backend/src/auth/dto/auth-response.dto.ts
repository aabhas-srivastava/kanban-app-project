import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty()
  name: string | undefined;

  @ApiProperty()
  email: string | undefined;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string | undefined;

  @ApiProperty()
  refreshToken: string | undefined;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto | undefined;
}
