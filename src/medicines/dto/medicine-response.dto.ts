import { ApiProperty } from '@nestjs/swagger';

export class MedicineResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty() dosage!: string;
  @ApiProperty() type!: string;
  @ApiProperty({ nullable: true }) manufacturer!: string | null;
  @ApiProperty() stock!: number;
  @ApiProperty() reorderLevel!: number;
  @ApiProperty() unit!: string;
  @ApiProperty({ nullable: true }) batchNo!: string | null;
  @ApiProperty({ nullable: true }) expiryDate!: Date | null;
  @ApiProperty({ example: '12.50' }) price!: any; // Prisma.Decimal serialized
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedMedicineResponseDto {
  @ApiProperty({ type: [MedicineResponseDto] })
  data!: MedicineResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}