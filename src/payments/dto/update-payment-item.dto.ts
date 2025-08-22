import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePaymentItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  /** Decimal as string */
  @ApiPropertyOptional() @IsOptional() @IsString()
  amount?: string;
}