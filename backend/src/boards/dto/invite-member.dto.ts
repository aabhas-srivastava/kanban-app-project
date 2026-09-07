import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string | undefined;

  @ApiProperty({ enum: Role, example: 'MEMBER' })
  @IsEnum(Role)
  role: Role | undefined;
}
