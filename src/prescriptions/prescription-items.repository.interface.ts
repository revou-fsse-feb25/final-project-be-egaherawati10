import { Prisma } from '@prisma/client';

export interface IPrescriptionItemsRepository {
  create(data: Prisma.PrescriptionItemCreateInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  findManyForPrescription(prescriptionId: number, page: number, limit: number): Promise<{ data: any[]; total: number }>;
  update(id: number, data: Prisma.PrescriptionItemUpdateInput): Promise<any>;
  delete(id: number): Promise<void>;
}