import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'My Board' })
  @IsString()
  @IsNotEmpty()
  title: string | undefined;

  @ApiProperty({ example: 'Project description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
