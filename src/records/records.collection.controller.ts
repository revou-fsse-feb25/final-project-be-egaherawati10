import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { RECORDS_SERVICE, IRecordsService } from './records.service.interface';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import { PaginatedRecordResponseDto, RecordResponseDto } from './dto/record-response.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('medical-records.records')
@ApiBearerAuth()
@Controller() // base from RouterModule: /medical-records/:medicalRecordId/records
export class RecordsCollectionController {
  constructor(
    @Inject(RECORDS_SERVICE) private readonly service: IRecordsService,
  ) {}

  @Get()
  @Can('Record', 'read')
  @ApiOkResponse({ type: PaginatedRecordResponseDto })
  list(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Query() q: QueryRecordDto,
    @Req() req: any,
  ) {
    return this.service.listForMedicalRecord(medicalRecordId, q, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('Record', 'create')
  @ApiCreatedResponse({ type: RecordResponseDto })
  create(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Body() dto: CreateRecordDto,
    @Req() req: any,
  ) {
    return this.service.createForMedicalRecord(medicalRecordId, { id: req.user.id, role: req.user.role }, dto);
  }
}