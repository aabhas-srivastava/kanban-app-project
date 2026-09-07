import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  boardId: string | undefined;

  @ApiProperty({ example: 'To Do' })
  @IsString()
  @IsNotEmpty()
  title: string | undefined;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  position?: number;
}
