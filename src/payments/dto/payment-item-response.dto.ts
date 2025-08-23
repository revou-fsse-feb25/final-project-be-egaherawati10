import { ApiProperty } from '@nestjs/swagger';
import { PaymentItemKind } from '@prisma/client';

export class PaymentItemResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() paymentId!: number;
  @ApiProperty({ enum: PaymentItemKind }) kind!: PaymentItemKind;
  @ApiProperty() description!: string;
  @ApiProperty({ example: '10.00' }) amount!: any;
  @ApiProperty({ nullable: true }) prescriptionItemId!: number | null;
  @ApiProperty({ nullable: true }) serviceOnServiceItemId!: number | null;
}