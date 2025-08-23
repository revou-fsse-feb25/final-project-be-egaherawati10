import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IPrescriptionsRepository } from './prescriptions.repository.interface';

const select = {
  id: true, code: true, medicalRecordId: true, patientId: true,
  doctorId: true, pharmacistId: true, status: true,
  dateIssued: true, dateDispensed: true, notes: true,
  createdAt: true, updatedAt: true,
};

@Injectable()
export class PrescriptionsRepository implements IPrescriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PrescriptionCreateInput) {
    return this.prisma.prescription.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.prescription.findFirst({
      where: { id, deletedAt: null },
      select,
    });
  }

  async findMany(args: {
    where: Prisma.PrescriptionWhereInput; page: number; limit: number;
    sortBy: 'dateIssued' | 'dateDispensed' | 'updatedAt'; order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.prescription.findMany({
        where: { ...where, deletedAt: null },
        select, orderBy: { [sortBy]: order }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.prescription.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.PrescriptionUpdateInput) {
    try {
      return await this.prisma.prescription.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Prescription not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.prescription.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Prescription not found');
      throw e;
    }
  }
}