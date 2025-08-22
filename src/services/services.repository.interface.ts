import { Prisma } from '@prisma/client';

export interface IServicesRepository {
  create(data: Prisma.ServiceCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.ServiceWhereInput;
    page: number; limit: number;
    sortBy: 'serviceDate' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.ServiceUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}