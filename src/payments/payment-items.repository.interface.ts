import { Prisma } from '@prisma/client';

export interface IPaymentItemsRepository {
  create(data: Prisma.PaymentItemCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findManyForPayment(paymentId: number, page: number, limit: number): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.PaymentItemUpdateInput): Promise<any>;
  delete(id: number): Promise<void>;
}