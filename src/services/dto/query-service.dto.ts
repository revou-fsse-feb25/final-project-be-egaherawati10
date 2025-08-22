import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class QueryServiceDto {
  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsOptional() @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional() @IsOptional()
  from?: string; // ISO

  @ApiPropertyOptional() @IsOptional()
  to?: string;   // ISO

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['serviceDate','createdAt','updatedAt'], default: 'serviceDate' })
  @IsOptional()
  sortBy?: 'serviceDate' | 'createdAt' | 'updatedAt' = 'serviceDate';

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'desc' })
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}