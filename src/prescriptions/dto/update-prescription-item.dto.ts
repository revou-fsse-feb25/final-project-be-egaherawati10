import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdatePrescriptionItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  dosage?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @IsPositive()
  quantity?: number;

  @ApiPropertyOptional() @IsOptional()
  price?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  instructions?: string | null;
}