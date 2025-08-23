import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IPaymentsRepository } from './payments.repository.interface';

const select = {
  id: true, code: true, medicalRecordId: true, patientId: true,
  status: true, method: true, issuedAt: true, paidAt: true,
  totalAmount: true, createdAt: true, updatedAt: true,
};

@Injectable()
export class PaymentsRepository implements IPaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.payment.findFirst({
      where: { id, deletedAt: null },
      select,
    });
  }

  async findMany(args: {
    where: Prisma.PaymentWhereInput; page: number; limit: number;
    sortBy: 'issuedAt' | 'paidAt' | 'updatedAt'; order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { ...where, deletedAt: null },
        select, orderBy: { [sortBy]: order }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.payment.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.PaymentUpdateInput) {
    try {
      return await this.prisma.payment.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Payment not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.payment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Payment not found');
      throw e;
    }
  }
}