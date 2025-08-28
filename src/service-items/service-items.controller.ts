import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICE_ITEMS_SERVICE, IServiceItemsService } from './service-items.service.interface';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { PaginatedServiceItemResponseDto, ServiceItemResponseDto } from './dto/service-item-response.dto';
import { Can } from '../common/guards/can.decorator';

// Lightweight req.user typing for guards-populated payload
type ReqUser = { user: { id: number; role?: string } };

@ApiTags('service-items')
@ApiBearerAuth('jwt')
@Controller('service-items')
export class ServiceItemsController {
  constructor(
    @Inject(SERVICE_ITEMS_SERVICE) private readonly service: IServiceItemsService,
  ) {}

  @Get()
  @Can('ServiceItem', 'read')
  @ApiOperation({ summary: 'List service catalog items' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Free-text search' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiOkResponse({ type: PaginatedServiceItemResponseDto })
  list(@Query() q: QueryServiceItemDto) {
    return this.service.list(q);
  }

  @Post()
  @Can('ServiceItem', 'create')
  @ApiOperation({ summary: 'Create a service catalog item' })
  @ApiCreatedResponse({ type: ServiceItemResponseDto })
  @ApiConflictResponse({ description: 'Name/code already exists' })
  create(@Body() dto: CreateServiceItemDto, @Req() req: ReqUser) {
    return this.service.create(dto, req.user.id);
  }

  @Get(':id')
  @Can('ServiceItem', 'read')
  @ApiOperation({ summary: 'Get a single service item' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ServiceItemResponseDto })
  @ApiNotFoundResponse({ description: 'Service item not found' })
  getOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Can('ServiceItem', 'update')
  @ApiOperation({ summary: 'Update a service item' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ServiceItemResponseDto })
  @ApiNotFoundResponse({ description: 'Service item not found' })
  @ApiConflictResponse({ description: 'Unique constraint conflict' })
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Body() dto: UpdateServiceItemDto,
    @Req() req: ReqUser,
  ) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Can('ServiceItem', 'delete')
  @ApiOperation({ summary: 'Soft delete a service item' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Soft-deleted' })
  @ApiNotFoundResponse({ description: 'Service item not found' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number) {
    return this.service.delete(id);
  }
}