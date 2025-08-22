import { QueryPaymentDto } from './dto/query-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CreatePaymentItemDto } from './dto/create-payment-item.dto';
import { UpdatePaymentItemDto } from './dto/update-payment-item.dto';
import { PaymentItemResponseDto } from './dto/payment-item-response.dto';

export type UserCtx = { id: number; role: string };

export interface IPaymentsService {
  // payments
  createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreatePaymentDto): Promise<PaymentResponseDto>;
  listForMedicalRecord(medicalRecordId: number, q: QueryPaymentDto, currentUser: UserCtx): Promise<{ data: PaymentResponseDto[]; meta: any }>;
  findById(id: number, currentUser: UserCtx): Promise<PaymentResponseDto>;
  update(id: number, actorId: number, dto: UpdatePaymentDto): Promise<PaymentResponseDto>;
  delete(id: number): Promise<void>;

  // items
  listItems(paymentId: number, page: number, limit: number, currentUser: UserCtx): Promise<{ data: PaymentItemResponseDto[]; meta: any }>;
  addItem(paymentId: number, actor: UserCtx, dto: CreatePaymentItemDto): Promise<PaymentItemResponseDto>;
  findItemById(id: number, currentUser: UserCtx): Promise<PaymentItemResponseDto>;
  updateItem(id: number, actorId: number, dto: UpdatePaymentItemDto): Promise<PaymentItemResponseDto>;
  deleteItem(id: number): Promise<void>;
}

export const PAYMENTS_SERVICE = Symbol('PAYMENTS_SERVICE');