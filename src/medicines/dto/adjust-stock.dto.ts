import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AdjustStockDto {
  /** Positive to add, negative to subtract */
  @ApiProperty({ example: -3 })
  @IsInt()
  delta!: number;
}