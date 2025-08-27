import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { RECORDS_SERVICE, IRecordsService } from './records.service.interface';
import { RecordResponseDto } from './dto/record-response.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('records')
@ApiBearerAuth('jwt')
@Controller() // RouterModule: /records
export class RecordsItemsController {
  constructor(
    @Inject(RECORDS_SERVICE) private readonly service: IRecordsService,
  ) {}

  @Get('/records/:id')
  @Can('Record', 'read')
  @ApiOkResponse({ type: RecordResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch('/records/:id')
  @Can('Record', 'update')
  @ApiOkResponse({ type: RecordResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRecordDto, @Req() req: any) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete('/records/:id')
  @Can('Record', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}