import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PrescriptionStatus } from '@prisma/client';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  doctorId?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  pharmacistId?: number;

  @ApiPropertyOptional({ enum: PrescriptionStatus })
  @IsOptional() @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  /** Only used by admins/pharmacists if you want to manually set */
  @ApiPropertyOptional() @IsOptional() @IsDateString()
  dateDispensed?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string | null;
}