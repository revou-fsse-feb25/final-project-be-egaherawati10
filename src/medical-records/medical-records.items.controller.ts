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
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';
  import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { Can } from '../common/guards/can.decorator';
import { IMedicalRecordsService, MEDICAL_RECORDS_SERVICE } from './medical-records.service.interface';
import { Inject } from '@nestjs/common';

// Match your UserCtx (id + role), avoiding `any`
type ReqUser = { user: { id: number; role: string } };

@ApiTags('medical-records')
@ApiBearerAuth('jwt')
// This controller is mounted by RouterModule at /medical-records
@Controller()
export class MedicalRecordsItemsController {
  constructor(
    @Inject(MEDICAL_RECORDS_SERVICE)
    private readonly service: IMedicalRecordsService,
  ) {}

  @Get(':id')
  @Can('MedicalRecord', 'read')
  @ApiOperation({ summary: 'Get a single medical record' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Medical record not found' })
  getOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Req() req: ReqUser,
  ) {
    return this.service.findById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('MedicalRecord', 'update')
  @ApiOperation({ summary: 'Update a medical record' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MedicalRecordResponseDto })
  @ApiNotFoundResponse({ description: 'Medical record not found' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Body() dto: UpdateMedicalRecordDto,
    @Req() req: ReqUser,
  ) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Can('MedicalRecord', 'delete')
  @ApiOperation({ summary: 'Delete (soft) a medical record' })
  @ApiParam({ name: 'id', type: Number })
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Soft-deleted' })
  @ApiNotFoundResponse({ description: 'Medical record not found' })
  remove(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
  ): Promise<void> {
    return this.service.delete(id);
  }
}