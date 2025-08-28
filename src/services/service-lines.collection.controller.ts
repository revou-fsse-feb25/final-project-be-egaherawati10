import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICES_SERVICE, IServicesService } from './services.service.interface';
import { CreateServiceLineDto } from './dto/create-service-line.dto';
import { ServiceLineResponseDto } from './dto/service-line-response.dto';
import { PaginatedServiceLineResponseDto } from './dto/paginated-service-line-response.dto';
import { Can } from '../common/guards/can.decorator';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

// req.user as populated by JwtStrategy.validate — role REQUIRED to match UserCtx
type ReqUser = { user: { id: number; role: string } };

class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

@ApiTags('service-lines')
@ApiBearerAuth('jwt')
@Controller('services/:serviceId/lines')
export class ServiceLinesCollectionController {
  constructor(@Inject(SERVICES_SERVICE) private readonly service: IServicesService) {}

  @Get()
  @Can('ServiceOnServiceItem', 'read')
  @ApiOperation({ summary: 'List lines for a service' })
  @ApiParam({ name: 'serviceId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Max 100' })
  @ApiOkResponse({ type: PaginatedServiceLineResponseDto })
  @ApiNotFoundResponse({ description: 'Service not found' })
  list(
    @Param('serviceId', new ParseIntPipe({ errorHttpStatusCode: 422 })) serviceId: number,
    @Query() q: PaginationDto,
    @Req() req: ReqUser,
  ) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    return this.service.listLines(serviceId, page, limit, {
      id: req.user.id,
      role: req.user.role,
    });
  }

  @Post()
  @Can('ServiceOnServiceItem', 'create')
  @ApiOperation({ summary: 'Add a line to a service' })
  @ApiParam({ name: 'serviceId', type: Number })
  @ApiCreatedResponse({ type: ServiceLineResponseDto })
  @ApiNotFoundResponse({ description: 'Service or service item not found' })
  @ApiConflictResponse({ description: 'Duplicate line or constraint conflict' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  add(
    @Param('serviceId', new ParseIntPipe({ errorHttpStatusCode: 422 })) serviceId: number,
    @Body() dto: CreateServiceLineDto,
    @Req() req: ReqUser,
  ) {
    return this.service.addLine(serviceId, { id: req.user.id, role: req.user.role }, dto);
  }
}