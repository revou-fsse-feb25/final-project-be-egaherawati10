import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { QueryMedicalRecordDto } from './dto/query-medical-record.dto';
import { CreateMedicalRecordForPatientDto } from './dto/create-medical-record.dto';
import {
  MedicalRecordResponseDto,
  PaginatedMedicalRecordResponseDto,
} from './dto/medical-record-response.dto';
import { Can } from '../common/guards/can.decorator';
import {
  IMedicalRecordsService,
  MEDICAL_RECORDS_SERVICE,
} from './medical-records.service.interface';

type Actor = { id: number; role: string };

@ApiTags('patients.medical-records')
@ApiBearerAuth('jwt')
@Controller('patients/:patientId/medical-records')
export class MedicalRecordsCollectionController {
  constructor(
    @Inject(MEDICAL_RECORDS_SERVICE)
    private readonly service: IMedicalRecordsService,
  ) {}

  @Get()
  @Can('MedicalRecord', 'read')
  @ApiParam({ name: 'patientId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiOkResponse({ type: PaginatedMedicalRecordResponseDto })
  list(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Query() q: QueryMedicalRecordDto,
    @Req() req: any,
  ) {
    const actor: Actor = { id: req.user.id, role: req.user.role };
    return this.service.listForPatient(patientId, q, actor);
  }

  @Get(':medicalRecordId')
  @Can('MedicalRecord', 'read')
  @ApiParam({ name: 'patientId', type: Number })
  @ApiParam({ name: 'medicalRecordId', type: Number })
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  getOne(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Req() req: any,
  ) {
    const actor: Actor = { id: req.user.id, role: req.user.role };
    return this.service.getOneForPatient(patientId, medicalRecordId, actor);
  }

  @Post()
  @Can('MedicalRecord', 'create')
  @ApiParam({ name: 'patientId', type: Number })
  @ApiCreatedResponse({ type: MedicalRecordResponseDto })
  create(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() dto: CreateMedicalRecordForPatientDto,
    @Req() req: any,
  ) {
    return this.service.createForPatient(patientId, dto, req.user.id);
  }
}