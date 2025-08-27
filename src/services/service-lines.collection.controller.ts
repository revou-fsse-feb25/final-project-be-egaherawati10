import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICES_SERVICE, IServicesService } from './services.service.interface';
import { CreateServiceLineDto } from './dto/create-service-line.dto';
import { ServiceLineResponseDto } from './dto/service-line-response.dto';
import { Can } from '../common/guards/can.decorator';

class PaginationDto {
  page?: number = 1;
  limit?: number = 20;
}

@ApiTags('services.lines')
@ApiBearerAuth('jwt')
@Controller('services/:serviceId/lines')
export class ServiceLinesCollectionController {
  constructor(@Inject(SERVICES_SERVICE) private readonly service: IServicesService) {}

  @Get()
  @Can('ServiceOnServiceItem', 'read')
  @ApiOkResponse({ description: 'List lines for this service' })
  list(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Query() q: PaginationDto,
    @Req() req: any,
  ) {
    return this.service.listLines(serviceId, q.page ?? 1, q.limit ?? 20, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('ServiceOnServiceItem', 'create')
  @ApiCreatedResponse({ type: ServiceLineResponseDto })
  add(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() dto: CreateServiceLineDto,
    @Req() req: any,
  ) {
    return this.service.addLine(serviceId, { id: req.user.id, role: req.user.role }, dto);
  }
}