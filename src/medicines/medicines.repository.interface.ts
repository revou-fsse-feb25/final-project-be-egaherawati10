import { Prisma } from '@prisma/client';

export interface IMedicinesRepository {
  create(data: Prisma.MedicineCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.MedicineWhereInput;
    page: number;
    limit: number;
    sortBy: 'name' | 'type' | 'price' | 'stock' | 'expiryDate' | 'createdAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.MedicineUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
  adjustStock(id: number, delta: number): Promise<any>;
}