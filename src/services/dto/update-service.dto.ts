import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class UpdateServiceDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsOptional() @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  serviceDate?: string;  // ← non-nullable; only set when provided
}