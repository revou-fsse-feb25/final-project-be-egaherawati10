import { Prisma } from '@prisma/client';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';

export interface IMedicinesService {
  create(dto: CreateMedicineDto): Promise<MedicineResponseDto>;
  list(q: QueryMedicineDto): Promise<{
    data: MedicineResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number; sortBy?: string; order?: string };
  }>;
  findById(id: number): Promise<MedicineResponseDto>;
  update(id: number, dto: UpdateMedicineDto): Promise<MedicineResponseDto>;
  delete(id: number): Promise<void>;
  adjustStock(id: number, delta: number): Promise<MedicineResponseDto>;
}

export const MEDICINES_SERVICE = Symbol('MEDICINES_SERVICE');