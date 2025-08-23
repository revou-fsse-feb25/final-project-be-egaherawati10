import { Prisma } from '@prisma/client';

export const RECORDS_REPOSITORY = Symbol('RECORDS_REPOSITORY');
export interface IRecordsRepository {
  create(data: Prisma.RecordCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.RecordWhereInput;
    page: number; limit: number;
    sortBy: 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.RecordUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}