import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';
import { CreatePrescriptionItemDto } from './dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './dto/update-prescription-item.dto';
import { PrescriptionItemResponseDto } from './dto/prescription-item-response.dto';

export type UserCtx = { id: number; role: string };

export interface IPrescriptionsService {
  // prescriptions
  createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreatePrescriptionDto): Promise<PrescriptionResponseDto>;
  listForMedicalRecord(medicalRecordId: number, q: QueryPrescriptionDto, currentUser: UserCtx): Promise<{ data: PrescriptionResponseDto[]; meta: any }>;
  findById(id: number, currentUser: UserCtx): Promise<PrescriptionResponseDto>;
  update(id: number, actorId: number, dto: UpdatePrescriptionDto): Promise<PrescriptionResponseDto>;
  delete(id: number): Promise<void>;

  // items
  listItems(prescriptionId: number, page: number, limit: number, currentUser: UserCtx): Promise<{ data: PrescriptionItemResponseDto[]; meta: any }>;
  addItem(prescriptionId: number, actor: UserCtx, dto: CreatePrescriptionItemDto): Promise<PrescriptionItemResponseDto>;
  findItemById(id: number, currentUser: UserCtx): Promise<PrescriptionItemResponseDto>;
  updateItem(id: number, actorId: number, dto: UpdatePrescriptionItemDto): Promise<PrescriptionItemResponseDto>;
  deleteItem(id: number): Promise<void>;
}

export const PRESCRIPTIONS_SERVICE = Symbol('PRESCRIPTIONS_SERVICE');