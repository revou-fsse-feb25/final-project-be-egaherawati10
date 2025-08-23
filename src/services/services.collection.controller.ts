import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { SERVICES_SERVICE, IServicesService } from './services.service.interface';
import { QueryServiceDto } from './dto/query-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { PaginatedServiceResponseDto, ServiceResponseDto } from './dto/service-response.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('medical-records.services')
@ApiBearerAuth()
@Controller('medical-records/:medicalRecordId/services')
export class ServicesCollectionController {
  constructor(@Inject(SERVICES_SERVICE) private readonly service: IServicesService) {}

  @Get()
  @Can('Service', 'read')
  @ApiOkResponse({ type: PaginatedServiceResponseDto })
  list(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Query() q: QueryServiceDto,
    @Req() req: any,
  ) {
    return this.service.listForMedicalRecord(medicalRecordId, q, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('Service', 'create')
  @ApiCreatedResponse({ type: ServiceResponseDto })
  create(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Body() dto: CreateServiceDto,
    @Req() req: any,
  ) {
    return this.service.createForMedicalRecord(medicalRecordId, { id: req.user.id, role: req.user.role }, dto);
  }
}