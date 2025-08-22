import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { MEDICINES_SERVICE, IMedicinesService } from './medicines.service.interface';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { PaginatedMedicineResponseDto, MedicineResponseDto } from './dto/medicine-response.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('medicines')
@ApiBearerAuth()
@Controller('medicines')
export class MedicinesController {
  constructor(@Inject(MEDICINES_SERVICE) private readonly service: IMedicinesService) {}

  @Get()
  @Can('Medicine', 'read')
  @ApiOkResponse({ type: PaginatedMedicineResponseDto })
  list(@Query() q: QueryMedicineDto) {
    return this.service.list(q);
  }

  @Post()
  @Can('Medicine', 'create')
  @ApiCreatedResponse({ type: MedicineResponseDto })
  create(@Body() dto: CreateMedicineDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  @Can('Medicine', 'read')
  @ApiOkResponse({ type: MedicineResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Can('Medicine', 'update')
  @ApiOkResponse({ type: MedicineResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicineDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Can('Medicine', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Post(':id/adjust-stock')
  @Can('Medicine', 'update')
  @ApiOkResponse({ type: MedicineResponseDto, description: 'Stock adjusted atomically' })
  adjustStock(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustStockDto) {
    return this.service.adjustStock(id, dto.delta);
  }
}