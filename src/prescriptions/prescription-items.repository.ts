import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IPrescriptionItemsRepository } from './prescription-items.repository.interface';

const select = {
  id: true, prescriptionId: true, medicineId: true, dosage: true, quantity: true, price: true, instructions: true,
};

@Injectable()
export class PrescriptionItemsRepository implements IPrescriptionItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PrescriptionItemCreateInput) {
    return this.prisma.prescriptionItem.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.prescriptionItem.findUnique({ where: { id }, select });
  }

  async findManyForPrescription(prescriptionId: number, page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.prescriptionItem.findMany({
        where: { prescriptionId }, select,
        orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.prescriptionItem.count({ where: { prescriptionId } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.PrescriptionItemUpdateInput) {
    try {
      return await this.prisma.prescriptionItem.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Prescription item not found');
      throw e;
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.prescriptionItem.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Prescription item not found');
      throw e;
    }
  }
}