import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePrescriptionItemDto {
  @ApiProperty() @IsInt() @Min(1)
  medicineId!: number;

  @ApiProperty() @IsString()
  dosage!: string;

  @ApiProperty() @IsInt() @IsPositive()
  quantity!: number;

  @ApiPropertyOptional() @IsOptional()
  price?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  instructions?: string;
}