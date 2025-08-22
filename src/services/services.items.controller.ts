import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICES_SERVICE, IServicesService } from './services.service.interface';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
export class ServicesItemsController {
  constructor(@Inject(SERVICES_SERVICE) private readonly service: IServicesService) {}

  @Get(':id')
  @Can('Service', 'read')
  @ApiOkResponse({ type: ServiceResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('Service', 'update')
  @ApiOkResponse({ type: ServiceResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto, @Req() req: any) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('Service', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}