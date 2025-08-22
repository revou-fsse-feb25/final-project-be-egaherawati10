import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() code!: string;
  @ApiProperty() patientId!: number;
  @ApiProperty() doctorId!: number;
  @ApiProperty() medicalRecordId!: number;
  @ApiProperty({ enum: ServiceStatus }) status!: ServiceStatus;
  @ApiProperty() serviceDate!: Date;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedServiceResponseDto {
  @ApiProperty({ type: [ServiceResponseDto] })
  data!: ServiceResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}