import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateCardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  columnId: string | undefined;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string | undefined;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  labels?: string[];
}
