import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IServicesRepository } from './services.repository.interface';

const select = {
  id: true, code: true, patientId: true, doctorId: true, medicalRecordId: true,
  status: true, serviceDate: true, createdAt: true, updatedAt: true,
};

@Injectable()
export class ServicesRepository implements IServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ServiceCreateInput) {
    return this.prisma.service.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.service.findFirst({
      where: { id, deletedAt: null },
      select,
    });
  }

  async findMany(args: {
    where: Prisma.ServiceWhereInput; page: number; limit: number;
    sortBy: 'serviceDate' | 'createdAt' | 'updatedAt'; order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where: { ...where, deletedAt: null },
        select, orderBy: { [sortBy]: order }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.service.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.ServiceUpdateInput) {
    try {
      return await this.prisma.service.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Service not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.service.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Service not found');
      throw e;
    }
  }
}