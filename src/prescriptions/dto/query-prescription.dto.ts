import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { PrescriptionStatus } from '@prisma/client';

export class QueryPrescriptionDto {
  @ApiPropertyOptional() @IsOptional()
  search?: string; // code/notes

  @ApiPropertyOptional({ enum: PrescriptionStatus })
  @IsOptional() @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiPropertyOptional() @IsOptional()
  from?: string; // ISO (by dateIssued)

  @ApiPropertyOptional() @IsOptional()
  to?: string; // ISO

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['dateIssued','dateDispensed','updatedAt'], default: 'dateIssued' })
  @IsOptional()
  sortBy?: 'dateIssued' | 'dateDispensed' | 'updatedAt' = 'dateIssued';

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'desc' })
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}