import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsPositive } from 'class-validator';

export class QueryServiceItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string; // matches name

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['name', 'price', 'createdAt'], default: 'name' })
  @IsOptional()
  @IsIn(['name', 'price', 'createdAt'])
  sortBy?: 'name' | 'price' | 'createdAt' = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';
}