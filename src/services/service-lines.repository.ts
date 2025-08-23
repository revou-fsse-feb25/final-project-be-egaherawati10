import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IServiceLinesRepository } from './service-lines.repository.interface';

const select = {
  id: true, serviceId: true, serviceItemId: true, quantity: true, unitPrice: true,
};

@Injectable()
export class ServiceLinesRepository implements IServiceLinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ServiceOnServiceItemCreateInput) {
    return this.prisma.serviceOnServiceItem.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.serviceOnServiceItem.findUnique({ where: { id }, select });
  }

  async findManyForService(serviceId: number, page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceOnServiceItem.findMany({
        where: { serviceId }, select,
        orderBy: { id: 'asc' }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.serviceOnServiceItem.count({ where: { serviceId } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.ServiceOnServiceItemUpdateInput) {
    try {
      return await this.prisma.serviceOnServiceItem.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Service line not found');
      throw e;
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.serviceOnServiceItem.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Service line not found');
      throw e;
    }
  }
}