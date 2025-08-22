import { Prisma } from '@prisma/client';

export interface IServiceLinesRepository {
  create(data: Prisma.ServiceOnServiceItemCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findManyForService(serviceId: number, page: number, limit: number): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.ServiceOnServiceItemUpdateInput): Promise<any>;
  delete(id: number): Promise<void>;
}