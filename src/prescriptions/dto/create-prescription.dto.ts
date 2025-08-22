import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PrescriptionStatus } from '@prisma/client';

export class CreatePrescriptionDto {
  /** If caller is a doctor, doctorId defaults to req.user.id; otherwise required */
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @ApiPropertyOptional({ enum: PrescriptionStatus, default: 'issued' })
  @IsOptional() @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;
}