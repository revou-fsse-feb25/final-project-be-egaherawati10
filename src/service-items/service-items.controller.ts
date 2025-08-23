import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICE_ITEMS_SERVICE, IServiceItemsService } from './service-items.service.interface';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { PaginatedServiceItemResponseDto, ServiceItemResponseDto } from './dto/service-item-response.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('service-items')
@ApiBearerAuth()
@Controller('service-items')
export class ServiceItemsController {
  constructor(
    @Inject(SERVICE_ITEMS_SERVICE) private readonly service: IServiceItemsService,
  ) {}

  @Get()
  @Can('ServiceItem', 'read')
  @ApiOkResponse({ type: PaginatedServiceItemResponseDto })
  list(@Query() q: QueryServiceItemDto) {
    return this.service.list(q);
  }

  @Post()
  @Can('ServiceItem', 'create')
  @ApiCreatedResponse({ type: ServiceItemResponseDto })
  create(@Body() dto: CreateServiceItemDto, @Req() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get(':id')
  @Can('ServiceItem', 'read')
  @ApiOkResponse({ type: ServiceItemResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Can('ServiceItem', 'update')
  @ApiOkResponse({ type: ServiceItemResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceItemDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Can('ServiceItem', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}