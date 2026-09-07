import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: Role, example: 'MEMBER' })
  @IsEnum(Role)
  role: Role | undefined;
}
