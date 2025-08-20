import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<T> {
  @ApiProperty({ example: 42 }) total!: number;
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) pageSize!: number;
  // "data" will be overridden in the decorator schema for each model
  @ApiProperty({ isArray: true, type: Object }) data!: T[];
}