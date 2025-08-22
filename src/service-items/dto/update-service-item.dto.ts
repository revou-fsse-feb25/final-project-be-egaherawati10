import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateServiceItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  /** Decimal as string, e.g. "25.00" */
  @ApiPropertyOptional({ example: '30.00' })
  @IsOptional()
  @IsString()
  price?: string;
}