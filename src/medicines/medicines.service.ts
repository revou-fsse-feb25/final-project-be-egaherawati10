import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma as PrismaNS } from '@prisma/client';
import { IMedicinesService } from './medicines.service.interface';
import {
  IMedicinesRepository,
  MedicineSortField,
} from './medicines.repository.interface';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { MedicineResponseDto } from './dto/medicine-response.dto';

const ALLOWED_SORT = new Set<MedicineSortField>(['name', 'price', 'createdAt']);

@Injectable()
export class MedicinesService implements IMedicinesService {
  constructor(
    @Inject('IMedicinesRepository') private readonly repo: IMedicinesRepository,
  ) {}

  private toDto(x: any): MedicineResponseDto {
    return x as MedicineResponseDto;
  }

  private parseDateOrThrow(value: string, field: string): Date {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw new BadRequestException(`${field} must be a valid ISO date`);
    return d;
  }

  private toDecimal(v: string | number): PrismaNS.Decimal {
    return new PrismaNS.Decimal(typeof v === 'number' ? v.toString() : v);
  }

  private mapPrismaError(e: unknown): never {
    if (e instanceof PrismaNS.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') throw new ConflictException('Combination of name + dosage must be unique');
      if (e.code === 'P2025') throw new NotFoundException('Medicine not found');
    }
    throw e;
  }

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
        expiryDate: dto.expiryDate ? this.parseDateOrThrow(dto.expiryDate, 'expiryDate') : null,
        price: this.toDecimal(dto.price),
      });
      return this.toDto(created);
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async list(q: QueryMedicineDto) {
    const now = new Date();
    const where: PrismaNS.MedicineWhereInput = {
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
      ...(q.isExpired === true ? { expiryDate: { lt: now } } : {}),
      ...(q.expireFrom || q.expireTo
        ? {
            expiryDate: {
              ...(q.expireFrom ? { gte: this.parseDateOrThrow(q.expireFrom, 'expireFrom') } : {}),
              ...(q.expireTo ? { lte: this.parseDateOrThrow(q.expireTo, 'expireTo') } : {}),
            },
          }
        : {}),
    };

    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const sortBy = (ALLOWED_SORT.has(q.sortBy as any) ? (q.sortBy as MedicineSortField) : 'name');
    const order = (q.order ?? 'asc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const { data, total } = await this.repo.findMany({ where, page, limit, sortBy, order });

    // NOTE: lowStock is a post-filter (Prisma can't compare two columns in where)
    const filtered = q.lowStock ? data.filter((m) => m.stock <= m.reorderLevel) : data;
    const effectiveTotal = q.lowStock ? filtered.length : total;

    return {
      data: filtered.map((m) => this.toDto(m)),
      meta: {
        page,
        limit,
        total: effectiveTotal,
        totalPages: Math.max(1, Math.ceil(effectiveTotal / limit)),
        sortBy,
        order,
      },
    };
  }

  async findById(id: number) {
    const med = await this.repo.findById(id);
    if (!med) throw new NotFoundException('Medicine not found');
    return this.toDto(med);
  }

  async update(id: number, dto: UpdateMedicineDto) {
    try {
      const data: PrismaNS.MedicineUpdateInput = {
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
            : { expiryDate: this.parseDateOrThrow(dto.expiryDate, 'expiryDate') }
          : {}),
        ...(dto.price !== undefined ? { price: this.toDecimal(dto.price) } : {}),
      };

      const updated = await this.repo.update(id, data);
      if (!updated) throw new NotFoundException('Medicine not found');
      return this.toDto(updated);
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async delete(id: number) {
    const ok = await this.repo.softDelete(id);          // ← boolean from repo
    if (!ok) throw new NotFoundException('Medicine not found');
  }

  async adjustStock(id: number, delta: number) {
    if (!Number.isInteger(delta)) throw new BadRequestException('delta must be an integer');
    const updated = await this.repo.adjustStock(id, delta);
    if (!updated) throw new NotFoundException('Medicine not found');
    return this.toDto(updated);
  }
}