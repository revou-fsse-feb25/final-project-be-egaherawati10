import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IRecordsRepository } from './records.repository.interface';

const select = {
  id: true,
  medicalRecordId: true,
  patientId: true,
  doctorId: true,
  subjective: true,
  objective: true,
  assessment: true,
  planning: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class RecordsRepository implements IRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.RecordCreateInput) {
    return this.prisma.record.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.record.findFirst({ where: { id, deletedAt: null }, select });
  }

  async findMany(args: {
    where: Prisma.RecordWhereInput; page: number; limit: number;
    sortBy: 'createdAt' | 'updatedAt'; order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.record.findMany({
        where: { ...where, deletedAt: null },
        select,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.record.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.RecordUpdateInput) {
    try {
      return await this.prisma.record.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Record not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.record.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Record not found');
      throw e;
    }
  }
}