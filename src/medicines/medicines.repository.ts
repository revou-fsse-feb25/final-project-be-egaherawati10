import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  FindManyParams,
  IMedicinesRepository,
  MedicineSafe,
} from './medicines.repository.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const selectSafe = {
  id: true,
  name: true,
  dosage: true,
  type: true,
  manufacturer: true,
  stock: true,
  reorderLevel: true,
  unit: true,
  batchNo: true,
  expiryDate: true,
  price: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class MedicinesRepository implements IMedicinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MedicineCreateInput): Promise<MedicineSafe> {
    return this.prisma.medicine.create({
      data,
      select: selectSafe,
    }) as any;
  }

  async findById(id: number): Promise<MedicineSafe | null> {
    return (await this.prisma.medicine.findUnique({
      where: { id },
      select: selectSafe,
    })) as any;
  }

  async findMany(params: FindManyParams): Promise<{ data: MedicineSafe[]; total: number }> {
    const { where, page, limit, sortBy, order } = params;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.medicine.count({ where }),
      this.prisma.medicine.findMany({
        where,
        select: selectSafe,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { total, data: data as any };
  }

  async update(id: number, data: Prisma.MedicineUpdateInput): Promise<MedicineSafe | null> {
    try {
      const updated = await this.prisma.medicine.update({
        where: { id },
        data,
        select: selectSafe,
      });
      return updated as any;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      await this.prisma.medicine.delete({ where: { id } });
      return true;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') return false;
      throw e;
    }
  }

  async adjustStock(id: number, delta: number): Promise<MedicineSafe | null> {
    try {
      const updated = await this.prisma.medicine.update({
        where: { id },
        data: { stock: { increment: delta } },
        select: selectSafe,
      });
      return updated as any;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }
}