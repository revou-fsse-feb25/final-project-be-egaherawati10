import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PRESCRIPTIONS_SERVICE, IPrescriptionsService } from './prescriptions.service.interface';
import { CreatePrescriptionItemDto } from './dto/create-prescription-item.dto';
import { PrescriptionItemResponseDto } from './dto/prescription-item-response.dto';
import { Can } from '../common/guards/can.decorator';

class PaginationDto { page?: number = 1; limit?: number = 20; }

@ApiTags('prescriptions.items')
@ApiBearerAuth('jwt')
@Controller('prescriptions/:prescriptionId/items')
export class PrescriptionItemsCollectionController {
  constructor(@Inject(PRESCRIPTIONS_SERVICE) private readonly service: IPrescriptionsService) {}

  @Get()
  @Can('PrescriptionItem', 'read')
  @ApiOkResponse({ description: 'List items for this prescription' })
  list(
    @Param('prescriptionId', ParseIntPipe) prescriptionId: number,
    @Query() q: PaginationDto,
    @Req() req: any,
  ) {
    return this.service.listItems(prescriptionId, q.page ?? 1, q.limit ?? 20, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('PrescriptionItem', 'create')
  @ApiCreatedResponse({ type: PrescriptionItemResponseDto })
  add(
    @Param('prescriptionId', ParseIntPipe) prescriptionId: number,
    @Body() dto: CreatePrescriptionItemDto,
    @Req() req: any,
  ) {
    return this.service.addItem(prescriptionId, { id: req.user.id, role: req.user.role }, dto);
  }
}