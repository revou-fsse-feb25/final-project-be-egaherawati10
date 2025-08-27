import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { RECORDS_SERVICE, IRecordsService } from './records.service.interface';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import {
  PaginatedRecordResponseDto,
  RecordResponseDto,
} from './dto/record-response.dto';
import { Can } from '../common/guards/can.decorator';

type RequestUser = { id: number; role: string };

function getUser(req: any): RequestUser {
  const u = req?.user;
  if (!u?.id || !u?.role) throw new UnauthorizedException('Not authenticated');
  return { id: u.id, role: u.role };
}

@ApiTags('medical-records.records')
@ApiBearerAuth()
@ApiParam({
  name: 'medicalRecordId',
  type: String, // <-- OpenAPI param is string
  required: true,
  description: 'ID of the medical record (integer)',
  example: '123',
})
@Controller('medical-records/:medicalRecordId/records')
export class RecordsCollectionController {
  constructor(
    @Inject(RECORDS_SERVICE)
    private readonly service: IRecordsService,
  ) {}

  @Get()
  @Can('Record', 'read')
  @ApiOkResponse({ type: PaginatedRecordResponseDto })
  list(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Query() q: QueryRecordDto,
    @Req() req: any,
  ) {
    const user = getUser(req);
    return this.service.listForMedicalRecord(medicalRecordId, q, user);
  }

  @Post()
  @Can('Record', 'create')
  @ApiCreatedResponse({ type: RecordResponseDto })
  create(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Body() dto: CreateRecordDto,
    @Req() req: any,
  ) {
    const user = getUser(req);
    return this.service.createForMedicalRecord(medicalRecordId, user, dto);
  }
}