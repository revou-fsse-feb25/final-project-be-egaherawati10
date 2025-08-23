import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateServiceLineDto {
  @ApiProperty() @IsInt() @Min(1)
  serviceItemId!: number;

  @ApiProperty() @IsInt() @IsPositive()
  quantity!: number;

  @ApiPropertyOptional() @IsOptional()
  unitPrice?: string;
}