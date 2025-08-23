import { ApiProperty } from '@nestjs/swagger';

export class PrescriptionItemResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() prescriptionId!: number;
  @ApiProperty() medicineId!: number;
  @ApiProperty() dosage!: string;
  @ApiProperty() quantity!: number;
  @ApiProperty() price!: any;
  @ApiProperty({ nullable: true }) instructions!: string | null;
}