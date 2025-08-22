import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateServiceLineDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @IsPositive()
  quantity?: number;

  @ApiPropertyOptional() @IsOptional()
  unitPrice?: string; // Decimal as string
}