import { Prisma } from '@prisma/client';

export interface IPaymentsRepository {
  create(data: Prisma.PaymentCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findMany(args: {
    where: Prisma.PaymentWhereInput;
    page: number; limit: number;
    sortBy: 'issuedAt' | 'paidAt' | 'updatedAt';
    order: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.PaymentUpdateInput): Promise<any>;
  softDelete(id: number): Promise<void>;
}