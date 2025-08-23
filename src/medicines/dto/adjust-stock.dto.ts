import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ example: -3 })
  @IsInt()
  delta!: number;
}