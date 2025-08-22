import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PRESCRIPTIONS_SERVICE, IPrescriptionsService } from './prescriptions.service.interface';
import { PrescriptionItemResponseDto } from './dto/prescription-item-response.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription-item.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('prescription-items')
@ApiBearerAuth()
@Controller('prescription-items')
export class PrescriptionItemsItemsController {
  constructor(@Inject(PRESCRIPTIONS_SERVICE) private readonly service: IPrescriptionsService) {}

  @Get(':id')
  @Can('PrescriptionItem', 'read')
  @ApiOkResponse({ type: PrescriptionItemResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findItemById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('PrescriptionItem', 'update')
  @ApiOkResponse({ type: PrescriptionItemResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePrescriptionItemDto, @Req() req: any) {
    return this.service.updateItem(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('PrescriptionItem', 'delete')
  @ApiOkResponse({ description: 'Deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteItem(id);
  }
}