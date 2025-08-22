import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IServiceItemsRepository } from './service-items.repository.interface';
import { IServiceItemsService } from './service-items.service.interface';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { ServiceItemResponseDto } from './dto/service-item-response.dto';
import { Prisma as PrismaNS } from '@prisma/client';

@Injectable()
export class ServiceItemsService implements IServiceItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: IServiceItemsRepository,
  ) {}

  private toDto(x: any): ServiceItemResponseDto { return x as ServiceItemResponseDto; }

  async create(dto: CreateServiceItemDto, actorId: number) {
    try {
      const created = await this.repo.create({
        name: dto.name,
        price: new PrismaNS.Decimal(dto.price),
        // creator/updater audit optional:
        // createdBy: { connect: { id: actorId } },
        // updatedBy: { connect: { id: actorId } },
      });
      return this.toDto(created);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Service item name must be unique');
      throw e;
    }
  }

  async list(q: QueryServiceItemDto) {
    const where: Prisma.ServiceItemWhereInput = {
      ...(q.search ? { name: { contains: q.search, mode: 'insensitive' } } : {}),
    };

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const { data, total } = await this.repo.findMany({
      where,
      page,
      limit,
      sortBy: q.sortBy ?? 'name',
      order: q.order ?? 'asc',
    });

    return {
      data: data.map(this.toDto),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async findById(id: number) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Service item not found');
    return this.toDto(item);
  }

  async update(id: number, dto: UpdateServiceItemDto, actorId: number) {
    try {
      const data: Prisma.ServiceItemUpdateInput = {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.price !== undefined ? { price: new PrismaNS.Decimal(dto.price) } : {}),
        // updatedBy: { connect: { id: actorId } },
      };
      const updated = await this.repo.update(id, data);
      return this.toDto(updated);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Service item name must be unique');
      throw e;
    }
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }
}