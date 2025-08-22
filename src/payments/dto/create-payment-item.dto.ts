import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentItemKind } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePaymentItemDto {
  @ApiProperty({ enum: PaymentItemKind })
  @IsEnum(PaymentItemKind)
  kind!: PaymentItemKind;

  // Choose ONE reference (or none for ad-hoc)
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  prescriptionItemId?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  serviceOnServiceItemId?: number;

  /** For ad-hoc charge or override */
  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  /** Decimal as string; if omitted and a reference is provided, auto-computed */
  @ApiPropertyOptional({ example: '50.00' })
  @IsOptional()
  @IsString()
  amount?: string;
}