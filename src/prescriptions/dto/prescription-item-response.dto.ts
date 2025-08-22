import { ApiProperty } from '@nestjs/swagger';

export class PrescriptionItemResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() prescriptionId!: number;
  @ApiProperty() medicineId!: number;
  @ApiProperty() dosage!: string;
  @ApiProperty() quantity!: number;
  @ApiProperty() price!: any; // Prisma.Decimal serialized
  @ApiProperty({ nullable: true }) instructions!: string | null;
}