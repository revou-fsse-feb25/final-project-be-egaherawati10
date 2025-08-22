import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMedicinesService } from './medicines.service.interface';
import { IMedicinesRepository } from './medicines.repository.interface';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';
import { Prisma as PrismaNS } from '@prisma/client';

@Injectable()
export class MedicinesService implements IMedicinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: IMedicinesRepository,
  ) {}

  private toDto(x: any): MedicineResponseDto { return x as MedicineResponseDto; }

  async create(dto: CreateMedicineDto) {
    try {
      const created = await this.repo.create({
        name: dto.name,
        dosage: dto.dosage,
        type: dto.type,
        manufacturer: dto.manufacturer ?? null,
        stock: dto.stock,
        reorderLevel: dto.reorderLevel ?? 0,
        unit: dto.unit ?? 'unit',
        batchNo: dto.batchNo ?? null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        price: new PrismaNS.Decimal(dto.price),
      });
      return this.toDto(created);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Combination of name + dosage must be unique');
      throw e;
    }
  }

  async list(q: QueryMedicineDto) {
    const now = new Date();

    const where: Prisma.MedicineWhereInput = {
      ...(q.search
        ? {
            OR: [
              { name: { contains: q.search, mode: 'insensitive' } },
              { dosage: { contains: q.search, mode: 'insensitive' } },
              { type: { contains: q.search, mode: 'insensitive' } },
              { manufacturer: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(q.type ? { type: { equals: q.type, mode: 'insensitive' } } : {}),
      ...(q.manufacturer ? { manufacturer: { contains: q.manufacturer, mode: 'insensitive' } } : {}),
      ...(q.inStock === true ? { stock: { gt: 0 } } : {}),
      ...(q.lowStock === true ? { stock: { lte: (q as any).reorderLevel ?? undefined } } : {}), // handled below if we also want reorderLevel filter
      ...(q.isExpired === true ? { expiryDate: { lt: now } } : {}),
      ...(q.expireFrom || q.expireTo
        ? {
            expiryDate: {
              ...(q.expireFrom ? { gte: new Date(q.expireFrom) } : {}),
              ...(q.expireTo ? { lte: new Date(q.expireTo) } : {}),
            },
          }
        : {}),
    };

    // lowStock means stock <= reorderLevel; Prisma can't express field-to-field comparison; we’ll filter in memory.
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const { data, total } = await this.repo.findMany({
      where,
      page,
      limit,
      sortBy: q.sortBy ?? 'name',
      order: q.order ?? 'asc',
    });

    const filtered = q.lowStock
      ? data.filter((m) => m.stock <= m.reorderLevel)
      : data;

    return {
      data: filtered.map(this.toDto),
      meta: { page, limit, total: q.lowStock ? filtered.length : total, totalPages: Math.max(1, Math.ceil((q.lowStock ? filtered.length : total) / limit)) },
    };
  }

  async findById(id: number) {
    const med = await this.repo.findById(id);
    if (!med) throw new NotFoundException('Medicine not found');
    return this.toDto(med);
  }

  async update(id: number, dto: UpdateMedicineDto) {
    try {
      const data: Prisma.MedicineUpdateInput = {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.dosage !== undefined ? { dosage: dto.dosage } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.manufacturer !== undefined ? { manufacturer: dto.manufacturer } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.reorderLevel !== undefined ? { reorderLevel: dto.reorderLevel } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.batchNo !== undefined ? { batchNo: dto.batchNo } : {}),
        ...(dto.expiryDate !== undefined
          ? dto.expiryDate === null
            ? { expiryDate: { set: null } }
            : { expiryDate: new Date(dto.expiryDate) }
          : {}),
        ...(dto.price !== undefined ? { price: new PrismaNS.Decimal(dto.price) } : {}),
      };

      const updated = await this.repo.update(id, data);
      return this.toDto(updated);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Combination of name + dosage must be unique');
      throw e;
    }
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }

  async adjustStock(id: number, delta: number) {
    if (!Number.isInteger(delta)) throw new BadRequestException('delta must be an integer');
    const updated = await this.repo.adjustStock(id, delta);
    return this.toDto(updated);
  }
}