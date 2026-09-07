import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cardId: string | undefined;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text: string | undefined;
}
