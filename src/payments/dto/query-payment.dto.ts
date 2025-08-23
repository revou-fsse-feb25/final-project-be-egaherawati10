import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';

export class QueryPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional() @IsOptional()
  from?: string; // ISO by issuedAt

  @ApiPropertyOptional() @IsOptional()
  to?: string;

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => Number(value)) @IsOptional() @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['issuedAt','paidAt','updatedAt'], default: 'issuedAt' })
  @IsOptional()
  sortBy?: 'issuedAt' | 'paidAt' | 'updatedAt' = 'issuedAt';

  @ApiPropertyOptional({ enum: ['asc','desc'], default: 'desc' })
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}