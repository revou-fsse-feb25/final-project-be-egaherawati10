import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMedicineDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  dosage?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  type?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  manufacturer?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  stock?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  reorderLevel?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  unit?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  batchNo?: string | null;

  @ApiPropertyOptional() @IsOptional()
  expiryDate?: string | null;

  @ApiPropertyOptional() @IsOptional() @IsString()
  price?: string;
}