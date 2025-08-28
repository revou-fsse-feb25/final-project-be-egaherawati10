import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICES_SERVICE, IServicesService } from './services.service.interface';
import { ServiceLineResponseDto } from './dto/service-line-response.dto';
import { UpdateServiceLineDto } from './dto/update-service-line.dto';
import { Can } from '../common/guards/can.decorator';

// Align with UserCtx in services.service.interface.ts
type ReqUser = { user: { id: number; role: string } };

@ApiTags('service-lines')
@ApiBearerAuth('jwt')
@Controller('service-lines')
export class ServiceLinesItemsController {
  constructor(
    @Inject(SERVICES_SERVICE) private readonly service: IServicesService,
  ) {}

  @Get(':id')
  @Can('ServiceOnServiceItem', 'read')
  @ApiOperation({ summary: 'Get a single service line' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ServiceLineResponseDto })
  @ApiNotFoundResponse({ description: 'Service line not found' })
  getOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Req() req: ReqUser,
  ) {
    return this.service.findLineById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('ServiceOnServiceItem', 'update')
  @ApiOperation({ summary: 'Update a service line' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ServiceLineResponseDto })
  @ApiNotFoundResponse({ description: 'Service line not found' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Body() dto: UpdateServiceLineDto,
    @Req() req: ReqUser,
  ) {
    return this.service.updateLine(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('ServiceOnServiceItem', 'delete')
  @ApiOperation({ summary: 'Delete a service line' })
  @ApiParam({ name: 'id', type: Number })
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Deleted successfully' })
  @ApiNotFoundResponse({ description: 'Service line not found' })
  remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
  ): Promise<void> {
    return this.service.deleteLine(id);
  }
}