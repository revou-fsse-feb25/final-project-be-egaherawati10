import { Prisma } from '@prisma/client';

export type MedicineSortField = 'name' | 'price' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export type FindManyParams = {
  where: Prisma.MedicineWhereInput;
  page: number;
  limit: number;
  sortBy: MedicineSortField;
  order: SortOrder;
};

export type MedicineSafe = {
  id: number;
  name: string;
  dosage: string;
  type: string;
  manufacturer: string | null;
  stock: number;
  reorderLevel: number;
  unit: string;
  batchNo: string | null;
  expiryDate: Date | null;
  price: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
};

export interface IMedicinesRepository {
  create(data: Prisma.MedicineCreateInput): Promise<MedicineSafe>;
  findById(id: number): Promise<MedicineSafe | null>;
  findMany(params: FindManyParams): Promise<{ data: MedicineSafe[]; total: number }>;
  update(id: number, data: Prisma.MedicineUpdateInput): Promise<MedicineSafe | null>;
  softDelete(id: number): Promise<boolean>;                  // ← returns boolean
  adjustStock(id: number, delta: number): Promise<MedicineSafe | null>;
}