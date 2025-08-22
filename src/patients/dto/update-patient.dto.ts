import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePatientDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional() @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  clerkId?: number | null;
}