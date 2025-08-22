import { Prisma } from '@prisma/client';

export interface IPrescriptionsRepository {
  create(data: Prisma.PrescriptionCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.PrescriptionWhereInput;
    page: number; limit: number;
    sortBy: 'dateIssued' | 'dateDispensed' | 'updatedAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.PrescriptionUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}