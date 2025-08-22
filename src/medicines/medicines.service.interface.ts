import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';

export interface IMedicinesService {
  create(dto: CreateMedicineDto): Promise<MedicineResponseDto>;
  list(q: QueryMedicineDto): Promise<{ data: MedicineResponseDto[]; meta: any }>;
  findById(id: number): Promise<MedicineResponseDto>;
  update(id: number, dto: UpdateMedicineDto): Promise<MedicineResponseDto>;
  delete(id: number): Promise<void>;
  adjustStock(id: number, delta: number): Promise<MedicineResponseDto>;
}

export const MEDICINES_SERVICE = Symbol('MEDICINES_SERVICE');