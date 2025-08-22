import { Prisma } from '@prisma/client';

export interface IServiceItemsRepository {
  create(data: Prisma.ServiceItemCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.ServiceItemWhereInput;
    page: number;
    limit: number;
    sortBy: 'name' | 'price' | 'createdAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.ServiceItemUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}