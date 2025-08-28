import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class PaginatedMetaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  limit!: number;

  @ApiProperty({ example: 135 })
  @IsInt()
  @Min(0)
  total!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNext!: boolean;

  @ApiProperty({ example: false })
  hasPrev!: boolean;
}