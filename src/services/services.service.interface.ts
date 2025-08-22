import { QueryServiceDto } from './dto/query-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { CreateServiceLineDto } from './dto/create-service-line.dto';
import { UpdateServiceLineDto } from './dto/update-service-line.dto';
import { ServiceLineResponseDto } from './dto/service-line-response.dto';

export type UserCtx = { id: number; role: string };

export interface IServicesService {
  // Services
  createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreateServiceDto): Promise<ServiceResponseDto>;
  listForMedicalRecord(medicalRecordId: number, q: QueryServiceDto, currentUser: UserCtx): Promise<{ data: ServiceResponseDto[]; meta: any }>;
  findById(id: number, currentUser: UserCtx): Promise<ServiceResponseDto>;
  update(id: number, actorId: number, dto: UpdateServiceDto): Promise<ServiceResponseDto>;
  delete(id: number): Promise<void>;

  // Service lines
  listLines(serviceId: number, page: number, limit: number, currentUser: UserCtx): Promise<{ data: ServiceLineResponseDto[]; meta: any }>;
  addLine(serviceId: number, actor: UserCtx, dto: CreateServiceLineDto): Promise<ServiceLineResponseDto>;
  findLineById(id: number, currentUser: UserCtx): Promise<ServiceLineResponseDto>;
  updateLine(id: number, actorId: number, dto: UpdateServiceLineDto): Promise<ServiceLineResponseDto>;
  deleteLine(id: number): Promise<void>;
}

export const SERVICES_SERVICE = Symbol('SERVICES_SERVICE');