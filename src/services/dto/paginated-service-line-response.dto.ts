import { ApiProperty } from '@nestjs/swagger';
import { ServiceLineResponseDto } from './service-line-response.dto';
import { PaginatedMetaDto } from './paginated-meta.dto';

export class PaginatedServiceLineResponseDto {
  @ApiProperty({ type: () => [ServiceLineResponseDto] })
  data!: ServiceLineResponseDto[];

  @ApiProperty({ type: () => PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}