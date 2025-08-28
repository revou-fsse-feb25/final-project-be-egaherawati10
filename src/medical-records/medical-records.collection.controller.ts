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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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

// Align with JwtStrategy.validate / UserCtx
type ReqUser = { user: { id: number; role: string } };

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
  @ApiOperation({ summary: 'List medical records for a patient' })
  @ApiParam({ name: 'patientId', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiOkResponse({ type: PaginatedMedicalRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  list(
    @Param('patientId', new ParseIntPipe({ errorHttpStatusCode: 422 })) patientId: number,
    @Query() q: QueryMedicalRecordDto,
    @Req() req: ReqUser,
  ) {
    const actor = { id: req.user.id, role: req.user.role };
    return this.service.listForPatient(patientId, q, actor);
  }

  @Get(':medicalRecordId')
  @Can('MedicalRecord', 'read')
  @ApiOperation({ summary: 'Get one medical record for a patient' })
  @ApiParam({ name: 'patientId', type: Number })
  @ApiParam({ name: 'medicalRecordId', type: Number })
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Medical record not found' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  getOne(
    @Param('patientId', new ParseIntPipe({ errorHttpStatusCode: 422 })) patientId: number,
    @Param('medicalRecordId', new ParseIntPipe({ errorHttpStatusCode: 422 })) medicalRecordId: number,
    @Req() req: ReqUser,
  ) {
    const actor = { id: req.user.id, role: req.user.role };
    return this.service.getOneForPatient(patientId, medicalRecordId, actor);
  }

  @Post()
  @Can('MedicalRecord', 'create')
  @ApiOperation({ summary: 'Create a medical record for a patient' })
  @ApiParam({ name: 'patientId', type: Number })
  @ApiCreatedResponse({ type: MedicalRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Patient not found' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  create(
    @Param('patientId', new ParseIntPipe({ errorHttpStatusCode: 422 })) patientId: number,
    @Body() dto: CreateMedicalRecordForPatientDto,
    @Req() req: ReqUser,
  ) {
    return this.service.createForPatient(patientId, dto, req.user.id);
  }
}