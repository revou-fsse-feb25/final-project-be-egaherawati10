import { ApiProperty } from '@nestjs/swagger';

export class ServiceLineResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() serviceId!: number;
  @ApiProperty() serviceItemId!: number;
  @ApiProperty() quantity!: number;
  @ApiProperty() unitPrice!: any;
}