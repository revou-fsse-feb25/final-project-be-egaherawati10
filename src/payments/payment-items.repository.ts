import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPaymentItemsRepository } from './payment-items.repository.interface';

const select = {
  id: true, paymentId: true, kind: true, description: true,
  amount: true, prescriptionItemId: true, serviceOnServiceItemId: true,
};

@Injectable()
export class PaymentItemsRepository implements IPaymentItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PaymentItemCreateInput) {
    return this.prisma.paymentItem.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.paymentItem.findUnique({ where: { id }, select });
  }

  async findManyForPayment(paymentId: number, page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.paymentItem.findMany({
        where: { paymentId },
        select, orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.paymentItem.count({ where: { paymentId } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.PaymentItemUpdateInput) {
    try {
      return await this.prisma.paymentItem.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Payment item not found');
      throw e;
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.paymentItem.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Payment item not found');
      throw e;
    }
  }
}