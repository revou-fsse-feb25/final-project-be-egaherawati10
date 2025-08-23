import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma as PrismaNS, PrescriptionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IPrescriptionsService, UserCtx } from './prescriptions.service.interface';
import { IPrescriptionsRepository } from './prescriptions.repository.interface';
import { IPrescriptionItemsRepository } from './prescription-items.repository.interface';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';
import { CreatePrescriptionItemDto } from './dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription-item.dto';
import { PrescriptionItemResponseDto } from './dto/prescription-item-response.dto';

@Injectable()
export class PrescriptionsService implements IPrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IPrescriptionsRepository') private readonly repo: IPrescriptionsRepository,          // ✅ token
    @Inject('IPrescriptionItemsRepository') private readonly itemsRepo: IPrescriptionItemsRepository, // ✅ token
  ) {}

  private toDto(x: any): PrescriptionResponseDto { return x as PrescriptionResponseDto; }
  private toItemDto(x: any): PrescriptionItemResponseDto { return x as PrescriptionItemResponseDto; }

  private async assertUserRole(userId: number, role: UserRole) {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!u || u.role !== role) throw new BadRequestException(`userId must reference a ${role}`);
  }

  private async getMR(medicalRecordId: number) {
    const mr = await this.prisma.medicalRecord.findFirst({
      where: { id: medicalRecordId, deletedAt: null },
      select: { id: true, patientId: true },
    });
    if (!mr) throw new NotFoundException('Medical record not found');
    return mr;
  }

  private async getPrescription(prescriptionId: number) {
    const p = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, deletedAt: null },
      select: { id: true, patientId: true, medicalRecordId: true, status: true },
    });
    if (!p) throw new NotFoundException('Prescription not found');
    return p;
  }

  private async assertPatientScope(user: UserCtx, patientId: number) {
    if (user.role !== 'patient') return;
    const me = await this.prisma.patientProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== patientId) throw new NotFoundException('Not found');
  }

  // ---------- prescriptions ----------
  async createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreatePrescriptionDto) {
    const mr = await this.getMR(medicalRecordId);

    const doctorId = dto.doctorId ?? (actor.role === 'doctor' ? actor.id : undefined);
    if (!doctorId) throw new BadRequestException('doctorId is required');
    await this.assertUserRole(doctorId, UserRole.doctor); // ✅ enum

    const created = await this.repo.create({
      medicalRecord: { connect: { id: medicalRecordId } },
      patient: { connect: { id: mr.patientId } },
      doctor: { connect: { id: doctorId } },
      status: dto.status ?? PrescriptionStatus.issued, // ✅ enum
      notes: dto.notes ?? null,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    return this.toDto(created);
  }

  async listForMedicalRecord(medicalRecordId: number, q: QueryPrescriptionDto, currentUser: UserCtx) {
    const mr = await this.getMR(medicalRecordId);
    await this.assertPatientScope(currentUser, mr.patientId);

    const where: PrismaNS.PrescriptionWhereInput = {
      medicalRecordId,
      patientId: mr.patientId,
      ...(q.status ? { status: q.status } : {}),
      ...(q.search ? {
        OR: [
          { code:  { contains: q.search, mode: 'insensitive' } },
          { notes: { contains: q.search, mode: 'insensitive' } },
        ],
      } : {}),
      ...(q.from || q.to ? {
        dateIssued: {
          ...(q.from ? { gte: new Date(q.from) } : {}),
          ...(q.to   ? { lte: new Date(q.to) }   : {}),
        },
      } : {}),
    };

    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));

    const { data, total } = await this.repo.findMany({
      where, page, limit, sortBy: q.sortBy ?? 'dateIssued', order: (q.order ?? 'desc') as 'asc' | 'desc',
    });

    return {
      data: data.map(this.toDto),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async findById(id: number, currentUser: UserCtx) {
    const rx = await this.repo.findById(id);
    if (!rx) throw new NotFoundException('Prescription not found');
    await this.assertPatientScope(currentUser, rx.patientId);
    return this.toDto(rx);
  }

  async update(id: number, actorId: number, dto: UpdatePrescriptionDto) {
    if (dto.doctorId      !== undefined) await this.assertUserRole(dto.doctorId,      UserRole.doctor);
    if (dto.pharmacistId  !== undefined) await this.assertUserRole(dto.pharmacistId,  UserRole.pharmacist);

    const updates: PrismaNS.PrescriptionUpdateInput = {
      ...(dto.doctorId      !== undefined ? { doctor:     { connect: { id: dto.doctorId } } } : {}),
      ...(dto.pharmacistId  !== undefined ? { pharmacist: { connect: { id: dto.pharmacistId } } } : {}),
      ...(dto.notes         !== undefined ? { notes: dto.notes } : {}),
      updatedBy: { connect: { id: actorId } },
    };

    // status / dateDispensed coupling
    if (dto.status !== undefined) {
      updates.status = dto.status;
      if (dto.status === PrescriptionStatus.dispensed) {
        updates.dateDispensed = dto.dateDispensed ? new Date(dto.dateDispensed) : new Date();
      } else {
        updates.dateDispensed = { set: null };
      }
    } else if (dto.dateDispensed !== undefined) {
      updates.dateDispensed = new Date(dto.dateDispensed);
    }

    const updated = await this.repo.update(id, updates);
    return this.toDto(updated);
  }

  async delete(id: number) { await this.repo.softDelete(id); }

  // ---------- items ----------
  async listItems(prescriptionId: number, page: number, limit: number, currentUser: UserCtx) {
    const rx = await this.getPrescription(prescriptionId);
    await this.assertPatientScope(currentUser, rx.patientId);

    const p = Math.max(1, page ?? 1);
    const l = Math.min(100, Math.max(1, limit ?? 20));

    const { data, total } = await this.itemsRepo.findManyForPrescription(prescriptionId, p, l);
    return { data: data.map(this.toItemDto), meta: { page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) } };
  }

  async addItem(prescriptionId: number, actor: UserCtx, dto: CreatePrescriptionItemDto) {
    const rx = await this.getPrescription(prescriptionId);
    await this.assertPatientScope(actor, rx.patientId);

    let price = dto.price;
    if (!price) {
      const med = await this.prisma.medicine.findUnique({ where: { id: dto.medicineId }, select: { id: true, price: true } });
      if (!med) throw new BadRequestException('Invalid medicineId');
      price = med.price.toString();
    }

    try {
      const created = await this.itemsRepo.create({
        prescription: { connect: { id: prescriptionId } },
        medicine:     { connect: { id: dto.medicineId } },
        dosage: dto.dosage,
        quantity: dto.quantity,
        price: new PrismaNS.Decimal(price),
        instructions: dto.instructions ?? null,
      });
      return this.toItemDto(created);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Medicine already added to this prescription');
      if (e?.code === 'P2003') throw new BadRequestException('Invalid foreign key');
      throw e;
    }
  }

  async findItemById(id: number, currentUser: UserCtx) {
    const item = await this.itemsRepo.findById(id);
    if (!item) throw new NotFoundException('Prescription item not found');
    const rx = await this.getPrescription(item.prescriptionId);
    await this.assertPatientScope(currentUser, rx.patientId);
    return this.toItemDto(item);
  }

  async updateItem(id: number, actorId: number, dto: UpdatePrescriptionItemDto) {
    const data: PrismaNS.PrescriptionItemUpdateInput = {
      ...(dto.dosage       !== undefined ? { dosage: dto.dosage } : {}),
      ...(dto.quantity     !== undefined ? { quantity: dto.quantity } : {}),
      ...(dto.price        !== undefined ? { price: new PrismaNS.Decimal(dto.price) } : {}),
      ...(dto.instructions !== undefined ? { instructions: dto.instructions } : {}),
    };
    return this.toItemDto(await this.itemsRepo.update(id, data));
  }

  async deleteItem(id: number) { await this.itemsRepo.delete(id); }
}