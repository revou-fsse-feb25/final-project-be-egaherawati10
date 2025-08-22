import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IServicesService, UserCtx } from './services.service.interface';
import { IServicesRepository } from './services.repository.interface';
import { IServiceLinesRepository } from './service-lines.repository.interface';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { CreateServiceLineDto } from './dto/create-service-line.dto';
import { UpdateServiceLineDto } from './dto/update-service-line.dto';
import { ServiceLineResponseDto } from './dto/service-line-response.dto';
import { Prisma as PrismaNS } from '@prisma/client';

type SortField = 'serviceDate' | 'createdAt' | 'updatedAt';
const ALLOWED_SORT_FIELDS: SortField[] = ['serviceDate', 'createdAt', 'updatedAt'];

@Injectable()
export class ServicesService implements IServicesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IServicesRepository') private readonly repo: IServicesRepository,          // ✅ token
    @Inject('IServiceLinesRepository') private readonly linesRepo: IServiceLinesRepository, // ✅ token
  ) {}

  private toDto(x: any): ServiceResponseDto { return x as ServiceResponseDto; }
  private toLineDto(x: any): ServiceLineResponseDto { return x as ServiceLineResponseDto; }

  private async assertUserRole(userId: number, role: UserRole) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!u || u.role !== role) {
      throw new BadRequestException(`userId must reference a ${role}`);
    }
  }

  private async getMR(medicalRecordId: number) {
    const mr = await this.prisma.medicalRecord.findFirst({
      where: { id: medicalRecordId, deletedAt: null },
      select: { id: true, patientId: true },
    });
    if (!mr) throw new NotFoundException('Medical record not found');
    return mr;
  }

  private async getService(serviceId: number) {
    const svc = await this.prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null },
      select: { id: true, patientId: true, medicalRecordId: true },
    });
    if (!svc) throw new NotFoundException('Service not found');
    return svc;
  }

  private async assertPatientScope(user: UserCtx, patientId: number) {
    if (user.role !== 'patient') return;
    const me = await this.prisma.patientProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== patientId) throw new NotFoundException('Not found');
  }

  // ---------- Services ----------
  async createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreateServiceDto) {
    const mr = await this.getMR(medicalRecordId);

    const doctorId = dto.doctorId ?? (actor.role === 'doctor' ? actor.id : undefined);
    if (!doctorId) throw new BadRequestException('doctorId is required');
    await this.assertUserRole(doctorId, UserRole.doctor); // ✅ enum, not string

    const created = await this.repo.create({
      patient: { connect: { id: mr.patientId } },
      doctor:  { connect: { id: doctorId } },
      medicalRecord: { connect: { id: medicalRecordId } },
      status: dto.status ?? 'planned',
      serviceDate: dto.serviceDate ? new Date(dto.serviceDate) : new Date(),
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    return this.toDto(created);
  }

  async listForMedicalRecord(medicalRecordId: number, q: QueryServiceDto, currentUser: UserCtx) {
    const mr = await this.getMR(medicalRecordId);
    await this.assertPatientScope(currentUser, mr.patientId);

    const where: Prisma.ServiceWhereInput = {
      medicalRecordId,
      patientId: mr.patientId,
      deletedAt: null, // ✅ ignore soft-deleted
      ...(q.status ? { status: q.status } : {}),
      ...(q.from || q.to
        ? {
            serviceDate: {
              ...(q.from ? { gte: new Date(q.from) } : {}),
              ...(q.to ? { lte: new Date(q.to) } : {}),
            },
          }
        : {}),
    };

    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const rawSortBy = (q.sortBy as SortField | undefined) ?? 'serviceDate';
    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : 'serviceDate';
    const order = (q.order ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const { data, total } = await this.repo.findMany({
      where, page, limit, sortBy, order,
    });

    return {
      data: data.map((x) => this.toDto(x)),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), sortBy, order },
    };
  }

  async findById(id: number, currentUser: UserCtx) {
    const svc = await this.repo.findById(id);
    if (!svc) throw new NotFoundException('Service not found');
    await this.assertPatientScope(currentUser, svc.patientId);
    return this.toDto(svc);
  }

  async update(id: number, actorId: number, dto: UpdateServiceDto) {
    if (dto.doctorId !== undefined) await this.assertUserRole(dto.doctorId, UserRole.doctor); // ✅ enum

    const data: Prisma.ServiceUpdateInput = {
      ...(dto.doctorId !== undefined ? { doctor: { connect: { id: dto.doctorId } } } : {}),
      ...(dto.status   !== undefined ? { status: dto.status } : {}),
      ...(dto.serviceDate !== undefined ? { serviceDate: new Date(dto.serviceDate) } : {}),
      updatedBy: { connect: { id: actorId } },
    };

    const updated = await this.repo.update(id, data);
    return this.toDto(updated);
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }

  // ---------- Service lines ----------
  async listLines(serviceId: number, page: number, limit: number, currentUser: UserCtx) {
    const svc = await this.getService(serviceId);
    await this.assertPatientScope(currentUser, svc.patientId);

    const p = Math.max(1, page ?? 1);
    const l = Math.min(100, Math.max(1, limit ?? 20));

    const { data, total } = await this.linesRepo.findManyForService(serviceId, p, l);
    return { data: data.map((x) => this.toLineDto(x)), meta: { page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) } };
  }

  async addLine(serviceId: number, actor: UserCtx, dto: CreateServiceLineDto) {
    const svc = await this.getService(serviceId);
    await this.assertPatientScope(actor, svc.patientId);

    // Default unitPrice from ServiceItem.price if not provided
    let unitPrice = dto.unitPrice;
    if (!unitPrice) {
      const item = await this.prisma.serviceItem.findUnique({
        where: { id: dto.serviceItemId },
        select: { id: true, price: true },
      });
      if (!item) throw new BadRequestException('Invalid serviceItemId');
      unitPrice = item.price.toString();
    }

    try {
      const created = await this.linesRepo.create({
        service: { connect: { id: serviceId } },
        serviceItem: { connect: { id: dto.serviceItemId } },
        quantity: dto.quantity,
        unitPrice: new PrismaNS.Decimal(unitPrice),
      });
      return this.toLineDto(created);
    } catch (e: any) {
      // more robust Prisma error mapping
      if (e?.code === 'P2002') throw new ConflictException('Service already contains this service item');
      if (e?.code === 'P2003') throw new BadRequestException('Invalid foreign key');
      throw e;
    }
  }

  async findLineById(id: number, currentUser: UserCtx) {
    const line = await this.linesRepo.findById(id);
    if (!line) throw new NotFoundException('Service line not found');

    const svc = await this.getService(line.serviceId);
    await this.assertPatientScope(currentUser, svc.patientId);
    return this.toLineDto(line);
  }

  async updateLine(id: number, actorId: number, dto: UpdateServiceLineDto) {
    const data: Prisma.ServiceOnServiceItemUpdateInput = {
      ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
      ...(dto.unitPrice !== undefined ? { unitPrice: new PrismaNS.Decimal(dto.unitPrice) } : {}),
    };
    return this.toLineDto(await this.linesRepo.update(id, data));
  }

  async deleteLine(id: number) {
    await this.linesRepo.delete(id);
  }
}