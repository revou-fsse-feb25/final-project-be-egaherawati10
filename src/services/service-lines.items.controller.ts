import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICES_SERVICE, IServicesService } from './services.service.interface';
import { ServiceLineResponseDto } from './dto/service-line-response.dto';
import { UpdateServiceLineDto } from './dto/update-service-line.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('service-lines')
@ApiBearerAuth('jwt')
@Controller('service-lines')
export class ServiceLinesItemsController {
  constructor(@Inject(SERVICES_SERVICE) private readonly service: IServicesService) {}

  @Get(':id')
  @Can('ServiceOnServiceItem', 'read')
  @ApiOkResponse({ type: ServiceLineResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findLineById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('ServiceOnServiceItem', 'update')
  @ApiOkResponse({ type: ServiceLineResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceLineDto, @Req() req: any) {
    return this.service.updateLine(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('ServiceOnServiceItem', 'delete')
  @ApiOkResponse({ description: 'Deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLine(id);
  }
}