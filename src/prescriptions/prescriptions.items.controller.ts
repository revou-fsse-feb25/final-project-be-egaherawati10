import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PRESCRIPTIONS_SERVICE, IPrescriptionsService } from './prescriptions.service.interface';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('prescriptions')
@ApiBearerAuth('jwt')
@Controller('prescriptions')
export class PrescriptionsItemsController {
  constructor(@Inject(PRESCRIPTIONS_SERVICE) private readonly service: IPrescriptionsService) {}

  @Get(':id')
  @Can('Prescription', 'read')
  @ApiOkResponse({ type: PrescriptionResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('Prescription', 'update')
  @ApiOkResponse({ type: PrescriptionResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePrescriptionDto, @Req() req: any) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('Prescription', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}