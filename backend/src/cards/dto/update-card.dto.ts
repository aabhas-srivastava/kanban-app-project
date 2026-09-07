import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UpdateCardDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

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

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
