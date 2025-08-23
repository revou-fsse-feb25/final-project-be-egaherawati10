import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentItemKind } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentItemDto {
  @ApiProperty({ enum: PaymentItemKind })
  @IsEnum(PaymentItemKind)
  kind!: PaymentItemKind;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  prescriptionItemId?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  serviceOnServiceItemId?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '50.00' })
  @IsOptional()
  @IsString()
  amount?: string;
}