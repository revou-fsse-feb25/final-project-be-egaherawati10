import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PRESCRIPTIONS_SERVICE, IPrescriptionsService } from './prescriptions.service.interface';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PaginatedPrescriptionResponseDto, PrescriptionResponseDto } from './dto/prescription-response.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('medical-records.prescriptions')
@ApiBearerAuth('jwt')
@Controller('medical-records/:medicalRecordId/prescriptions')
export class PrescriptionsCollectionController {
  constructor(@Inject(PRESCRIPTIONS_SERVICE) private readonly service: IPrescriptionsService) {}

  @Get()
  @Can('Prescription', 'read')
  @ApiOkResponse({ type: PaginatedPrescriptionResponseDto })
  list(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Query() q: QueryPrescriptionDto,
    @Req() req: any,
  ) {
    return this.service.listForMedicalRecord(medicalRecordId, q, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('Prescription', 'create')
  @ApiCreatedResponse({ type: PrescriptionResponseDto })
  create(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Body() dto: CreatePrescriptionDto,
    @Req() req: any,
  ) {
    return this.service.createForMedicalRecord(medicalRecordId, { id: req.user.id, role: req.user.role }, dto);
  }
}