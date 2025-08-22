import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class QueryRecordDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['createdAt','updatedAt'], default: 'createdAt' })
  @IsOptional() @IsIn(['createdAt','updatedAt'])
  sortBy?: 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'desc' })
  @IsOptional() @IsIn(['asc','desc'])
  order?: 'asc' | 'desc' = 'desc';
}