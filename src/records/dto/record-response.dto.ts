import { ApiProperty } from '@nestjs/swagger';

export class RecordResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() medicalRecordId!: number;
  @ApiProperty() patientId!: number;
  @ApiProperty() doctorId!: number;
  @ApiProperty({ nullable: true }) subjective!: string | null;
  @ApiProperty({ nullable: true }) objective!: string | null;
  @ApiProperty({ nullable: true }) assessment!: string | null;
  @ApiProperty({ nullable: true }) planning!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedRecordResponseDto {
  @ApiProperty({ type: [RecordResponseDto] })
  data!: RecordResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}