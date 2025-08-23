import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IServiceItemsRepository } from './service-items.repository.interface';

const select = {
  id: true,
  name: true,
  price: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class ServiceItemsRepository implements IServiceItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ServiceItemCreateInput) {
    return this.prisma.serviceItem.create({ data, select });
  }

  findById(id: number) {
    return this.prisma.serviceItem.findFirst({
      where: { id, deletedAt: null },
      select,
    });
  }

  async findMany(args: {
    where: Prisma.ServiceItemWhereInput;
    page: number;
    limit: number;
    sortBy: 'name' | 'price' | 'createdAt';
    order: 'asc' | 'desc';
  }) {
    const { where, page, limit, sortBy, order } = args;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceItem.findMany({
        where: { ...where, deletedAt: null },
        select,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.serviceItem.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async update(id: number, data: Prisma.ServiceItemUpdateInput) {
    try {
      return await this.prisma.serviceItem.update({ where: { id }, data, select });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Service item not found');
      throw e;
    }
  }

  async softDelete(id: number) {
    try {
      await this.prisma.serviceItem.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Service item not found');
      throw e;
    }
  }
}