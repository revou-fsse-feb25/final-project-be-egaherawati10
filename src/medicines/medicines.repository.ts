import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMedicinesRepository } from './medicines.repository.interface';

const select = {
  id: true, name: true, dosage: true, type: true, manufacturer: true,
  stock: true, reorderLevel: true, unit: true, batchNo: true, expiryDate: true,
  price: true, createdAt: true, updatedAt: true,
};

@Injectable()
export class MedicinesRepository implements IMedicinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MedicineCreateInput) {
    return this.prisma.medicine.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.medicine.findFirst({ where: { id, deletedAt: null }, select });
  }

  async findMany(args: {
    where: Prisma.MedicineWhereInput;
    page: number; limit: number;
    sortBy: 'name' | 'type' | 'price' | 'stock' | 'expiryDate' | 'createdAt';
    order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.medicine.findMany({
        where: { ...where, deletedAt: null },
        select, orderBy: { [sortBy]: order }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.medicine.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.MedicineUpdateInput) {
    try {
      return await this.prisma.medicine.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Medicine not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.medicine.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Medicine not found');
      throw e;
    }
  }

  async adjustStock(id: number, delta: number) {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.medicine.findFirst({
        where: { id, deletedAt: null }, select: { id: true, stock: true },
      });
      if (!row) throw new NotFoundException('Medicine not found');

      const next = row.stock + delta;
      if (next < 0) throw new BadRequestException('Stock cannot be negative');

      return tx.medicine.update({
        where: { id },
        data: { stock: { set: next } },
        select,
      });
    });
  }
}