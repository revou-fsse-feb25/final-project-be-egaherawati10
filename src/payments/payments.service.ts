import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma as PrismaNS, PaymentItemKind, PaymentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IPaymentsService, UserCtx } from './payments.service.interface';
import { IPaymentsRepository } from './payments.repository.interface';
import { IPaymentItemsRepository } from './payment-items.repository.interface';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CreatePaymentItemDto } from './dto/create-payment-item.dto';
import { UpdatePaymentItemDto } from './dto/update-payment-item.dto';
import { PaymentItemResponseDto } from './dto/payment-item-response.dto';

@Injectable()
export class PaymentsService implements IPaymentsService {
  constructor(
    private readonly prisma: PrismaService, // injected by type
    @Inject('IPaymentsRepository')
    private readonly repo: IPaymentsRepository, // injected by token ✅
    @Inject('IPaymentItemsRepository')
    private readonly itemsRepo: IPaymentItemsRepository, // injected by token ✅
  ) {}

  private toDto(x: any): PaymentResponseDto { return x as PaymentResponseDto; }
  private toItemDto(x: any): PaymentItemResponseDto { return x as PaymentItemResponseDto; }

  private async assertUserRole(userId: number, role: UserRole) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
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

  private async getPayment(paymentId: number) {
    const pay = await this.prisma.payment.findFirst({
      where: { id: paymentId, deletedAt: null },
      select: { id: true, patientId: true, medicalRecordId: true },
    });
    if (!pay) throw new NotFoundException('Payment not found');
    return pay;
  }

  private async assertPatientScope(user: UserCtx, patientId: number) {
    if (user.role !== 'patient') return;
    const me = await this.prisma.patientProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== patientId) throw new NotFoundException('Not found');
  }

  private async recomputeTotal(paymentId: number) {
    const items = await this.prisma.paymentItem.findMany({
      where: { paymentId },
      select: { amount: true },
    });
    const total = items.reduce(
      (acc, it) => acc.add(new PrismaNS.Decimal(it.amount.toString())),
      new PrismaNS.Decimal(0),
    );
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { totalAmount: total },
    });
  }

  // ---------- payments ----------
  async createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreatePaymentDto) {
    const mr = await this.getMR(medicalRecordId);

    const created = await this.repo.create({
      medicalRecord: { connect: { id: medicalRecordId } },
      patient: { connect: { id: mr.patientId } },
      method: dto.method,
      status: dto.status ?? PaymentStatus.pending,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
      // code, issuedAt, totalAmount via defaults
    });

    return this.toDto(created);
  }

  async listForMedicalRecord(medicalRecordId: number, q: QueryPaymentDto, currentUser: UserCtx) {
    const mr = await this.getMR(medicalRecordId);
    await this.assertPatientScope(currentUser, mr.patientId);

    const where: PrismaNS.PaymentWhereInput = {
      medicalRecordId,
      patientId: mr.patientId,
      deletedAt: null, // ignore soft-deleted ✅
      ...(q.status ? { status: q.status } : {}),
      ...(q.method ? { method: q.method } : {}),
      ...(q.search ? { code: { contains: q.search, mode: 'insensitive' } } : {}),
      ...(q.from || q.to
        ? {
            issuedAt: {
              ...(q.from ? { gte: new Date(q.from) } : {}),
              ...(q.to ? { lte: new Date(q.to) } : {}),
            },
          }
        : {}),
    };

    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const order: 'asc' | 'desc' = (q.order ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const { data, total } = await this.repo.findMany({
      where,
      page,
      limit,
      sortBy: q.sortBy ?? 'issuedAt',
      order,
    });

    return {
      data: data.map(this.toDto),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async findById(id: number, currentUser: UserCtx) {
    const pay = await this.repo.findById(id);
    if (!pay) throw new NotFoundException('Payment not found');
    await this.assertPatientScope(currentUser, pay.patientId);
    return this.toDto(pay);
  }

  async update(id: number, actorId: number, dto: UpdatePaymentDto) {
    const data: PrismaNS.PaymentUpdateInput = {
      ...(dto.method !== undefined ? { method: dto.method } : {}),
      updatedBy: { connect: { id: actorId } },
    };

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === PaymentStatus.paid) {
        data.paidAt = new Date();
      } else if (dto.status === PaymentStatus.pending || dto.status === PaymentStatus.cancelled) {
        data.paidAt = { set: null };
      }
    }

    const updated = await this.repo.update(id, data);
    return this.toDto(updated);
  }

  async delete(id: number) {
    await this.repo.softDelete(id);
  }

  // ---------- items ----------
  async listItems(paymentId: number, page: number, limit: number, currentUser: UserCtx) {
    const pay = await this.getPayment(paymentId);
    await this.assertPatientScope(currentUser, pay.patientId);

    const p = Math.max(1, page ?? 1);
    const l = Math.min(100, Math.max(1, limit ?? 20));

    const { data, total } = await this.itemsRepo.findManyForPayment(paymentId, p, l);
    return {
      data: data.map(this.toItemDto),
      meta: { page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) },
    };
  }

  async addItem(paymentId: number, actor: UserCtx, dto: CreatePaymentItemDto) {
    const pay = await this.getPayment(paymentId);
    await this.assertPatientScope(actor, pay.patientId);

    // Validate linking choice and kind synergy
    const hasRx = dto.prescriptionItemId !== undefined;
    const hasSvc = dto.serviceOnServiceItemId !== undefined;
    if (hasRx && hasSvc) throw new BadRequestException('Provide only one of prescriptionItemId or serviceOnServiceItemId');

    if (dto.kind === PaymentItemKind.prescription_item && !hasRx && !dto.amount)
      throw new BadRequestException('prescription_item requires prescriptionItemId or explicit amount');

    if (dto.kind === PaymentItemKind.service_item && !hasSvc && !dto.amount)
      throw new BadRequestException('service_item requires serviceOnServiceItemId or explicit amount');

    // Derive description/amount when linking
    let description = dto.description ?? '';
    let amount = dto.amount ? new PrismaNS.Decimal(dto.amount) : undefined;

    if (hasRx) {
      const pi = await this.prisma.prescriptionItem.findUnique({
        where: { id: dto.prescriptionItemId! },
        select: { id: true, price: true, quantity: true },
      });
      if (!pi) throw new BadRequestException('Invalid prescriptionItemId');
      if (!amount) amount = new PrismaNS.Decimal(pi.price.toString()).mul(pi.quantity);
      if (!description) description = `RX item ${pi.id}`;
    }

    if (hasSvc) {
      const sl = await this.prisma.serviceOnServiceItem.findUnique({
        where: { id: dto.serviceOnServiceItemId! },
        select: { id: true, unitPrice: true, quantity: true },
      });
      if (!sl) throw new BadRequestException('Invalid serviceOnServiceItemId');
      if (!amount) amount = new PrismaNS.Decimal(sl.unitPrice.toString()).mul(sl.quantity);
      if (!description) description = `Service line ${sl.id}`;
    }

    if (!amount) throw new BadRequestException('amount is required');

    try {
      const created = await this.itemsRepo.create({
        payment: { connect: { id: paymentId } },
        kind: dto.kind,
        description,
        amount,
        ...(hasRx ? { prescriptionItem: { connect: { id: dto.prescriptionItemId! } } } : {}),
        ...(hasSvc ? { serviceOnServiceItem: { connect: { id: dto.serviceOnServiceItemId! } } } : {}),
      });

      await this.recomputeTotal(paymentId);
      return this.toItemDto(created);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('This line is already charged in this payment');
      if (e?.code === 'P2003') throw new BadRequestException('Invalid foreign key');
      throw e;
    }
  }

  async findItemById(id: number, currentUser: UserCtx) {
    const item = await this.itemsRepo.findById(id);
    if (!item) throw new NotFoundException('Payment item not found');
    const pay = await this.getPayment(item.paymentId);
    await this.assertPatientScope(currentUser, pay.patientId);
    return this.toItemDto(item);
  }

  async updateItem(id: number, actorId: number, dto: UpdatePaymentItemDto) {
    const data: PrismaNS.PaymentItemUpdateInput = {
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.amount !== undefined ? { amount: new PrismaNS.Decimal(dto.amount) } : {}),
    };
    const updated = await this.itemsRepo.update(id, data);
    await this.recomputeTotal(updated.paymentId);
    return this.toItemDto(updated);
  }

  async deleteItem(id: number) {
    const item = await this.itemsRepo.findById(id);
    if (!item) throw new NotFoundException('Payment item not found');
    await this.itemsRepo.delete(id);
    await this.recomputeTotal(item.paymentId);
  }
}