import { ApiProperty } from '@nestjs/swagger';
import { PrescriptionStatus } from '@prisma/client';

export class PrescriptionResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() code!: string;
  @ApiProperty() medicalRecordId!: number;
  @ApiProperty() patientId!: number;
  @ApiProperty() doctorId!: number;
  @ApiProperty({ nullable: true }) pharmacistId!: number | null;
  @ApiProperty({ enum: PrescriptionStatus }) status!: PrescriptionStatus;
  @ApiProperty() dateIssued!: Date;
  @ApiProperty({ nullable: true }) dateDispensed!: Date | null;
  @ApiProperty({ nullable: true }) notes!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedPrescriptionResponseDto {
  @ApiProperty({ type: [PrescriptionResponseDto] })
  data!: PrescriptionResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}