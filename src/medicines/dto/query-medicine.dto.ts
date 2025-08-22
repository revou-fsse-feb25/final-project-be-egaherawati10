import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class QueryMedicineDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  search?: string; // name/dosage/manufacturer/type

  @ApiPropertyOptional() @IsOptional() @IsString()
  type?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true') @IsOptional() @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true') @IsOptional() @IsBoolean()
  lowStock?: boolean; // stock <= reorderLevel

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true') @IsOptional() @IsBoolean()
  isExpired?: boolean;

  /** ISO range filter on expiryDate */
  @ApiPropertyOptional() @IsOptional() @IsString()
  expireFrom?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  expireTo?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsInt() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['name','type','price','stock','expiryDate','createdAt'], default: 'name' })
  @IsOptional() @IsIn(['name','type','price','stock','expiryDate','createdAt'])
  sortBy?: 'name' | 'type' | 'price' | 'stock' | 'expiryDate' | 'createdAt' = 'name';

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'asc' })
  @IsOptional() @IsIn(['asc','desc'])
  order?: 'asc' | 'desc' = 'asc';
}