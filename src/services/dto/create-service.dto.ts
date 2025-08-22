import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class CreateServiceDto {
  /** If caller is a doctor, doctorId defaults to req.user.id; otherwise required */
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @ApiPropertyOptional({ enum: ServiceStatus, default: 'planned' })
  @IsOptional() @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  serviceDate?: string; // defaults to now()
}