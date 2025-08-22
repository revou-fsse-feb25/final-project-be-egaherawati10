import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  name!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  dosage!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  manufacturer?: string;

  @ApiProperty() @IsInt() @Min(0)
  stock!: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  reorderLevel?: number = 0;

  @ApiPropertyOptional() @IsOptional() @IsString()
  unit?: string = 'unit';

  @ApiPropertyOptional() @IsOptional() @IsString()
  batchNo?: string;

  /** ISO string, optional */
  @ApiPropertyOptional() @IsOptional() @IsString()
  expiryDate?: string;

  /** Decimal as string, e.g. "12.50" */
  @ApiProperty({ example: '12.50' }) @IsString() @IsNotEmpty()
  price!: string;
}