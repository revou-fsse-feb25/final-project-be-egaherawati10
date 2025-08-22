import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() code!: string;
  @ApiProperty() medicalRecordId!: number;
  @ApiProperty() patientId!: number;
  @ApiProperty({ enum: PaymentStatus }) status!: PaymentStatus;
  @ApiProperty({ enum: PaymentMethod }) method!: PaymentMethod;
  @ApiProperty() issuedAt!: Date;
  @ApiProperty({ nullable: true }) paidAt!: Date | null;
  @ApiProperty({ example: '0.00' }) totalAmount!: any; // Prisma.Decimal serialized
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedPaymentResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] })
  data!: PaymentResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}