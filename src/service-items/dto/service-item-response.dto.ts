import { ApiProperty } from '@nestjs/swagger';

export class ServiceItemResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() name!: string;
  @ApiProperty({ example: '25.00' }) price!: any; // Prisma.Decimal serialized
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class PaginatedServiceItemResponseDto {
  @ApiProperty({ type: [ServiceItemResponseDto] })
  data!: ServiceItemResponseDto[];

  @ApiProperty()
  meta!: { page: number; limit: number; total: number; totalPages: number };
}