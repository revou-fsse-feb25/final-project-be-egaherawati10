import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { MEDICINES_SERVICE, IMedicinesService } from './medicines.service.interface';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { PaginatedMedicineResponseDto, MedicineResponseDto } from './dto/medicine-response.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Can } from '../common/guards/can.decorator';

@ApiTags('medicines')
@ApiBearerAuth('jwt')
@Controller('medicines')
export class MedicinesController {
  constructor(@Inject(MEDICINES_SERVICE) private readonly service: IMedicinesService) {}

  @Get()
  @Can('Medicine', 'read')
  @ApiOperation({ summary: 'List medicines' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Free-text search' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiOkResponse({ type: PaginatedMedicineResponseDto })
  list(@Query() q: QueryMedicineDto) {
    return this.service.list(q);
  }

  @Post()
  @Can('Medicine', 'create')
  @ApiOperation({ summary: 'Create a medicine (catalog)' })
  @ApiCreatedResponse({ type: MedicineResponseDto })
  @ApiConflictResponse({ description: 'Name/code already exists' })
  create(@Body() dto: CreateMedicineDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @Can('Medicine', 'read')
  @ApiOperation({ summary: 'Get a single medicine' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MedicineResponseDto })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  getOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Can('Medicine', 'update')
  @ApiOperation({ summary: 'Update a medicine' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MedicineResponseDto })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  @ApiConflictResponse({ description: 'Unique constraint conflict' })
  update(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Can('Medicine', 'delete')
  @ApiOperation({ summary: 'Soft delete a medicine' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Soft-deleted' })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  remove(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number) {
    return this.service.delete(id);
  }

  @Post(':id/adjust-stock')
  @Can('Medicine', 'update')
  @ApiOperation({
    summary: 'Adjust stock atomically',
    description:
      'Use positive delta to add stock, negative to subtract. Service should enforce non-negative inventory.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MedicineResponseDto, description: 'Updated medicine with new stock' })
  @ApiNotFoundResponse({ description: 'Medicine not found' })
  @ApiConflictResponse({ description: 'Insufficient stock or concurrent update' })
  @ApiForbiddenResponse({ description: 'Role not allowed' })
  adjustStock(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 422 })) id: number,
    @Body() dto: AdjustStockDto,
  ) {
    // service is expected to handle tx, versioning, and preventing negative stock
    return this.service.adjustStock(id, dto.delta);
  }
}