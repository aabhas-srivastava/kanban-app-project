import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class MoveCardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  columnId: string | undefined;

  @ApiProperty()
  @IsNumber()
  position: number | undefined;
}
