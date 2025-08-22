import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRecordDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  subjective?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  objective?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  assessment?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  planning?: string;
}