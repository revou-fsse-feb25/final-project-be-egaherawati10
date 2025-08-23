import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';

export const RECORDS_SERVICE = Symbol('RECORDS_SERVICE');

export type UserCtx = { id: number; role: string };

export interface IRecordsService {
  createForMedicalRecord(medicalRecordId: number, actor: UserCtx, dto: CreateRecordDto): Promise<RecordResponseDto>;
  listForMedicalRecord(medicalRecordId: number, q: QueryRecordDto, currentUser: UserCtx): Promise<{ data: RecordResponseDto[]; meta: any }>;
  findById(id: number, currentUser: UserCtx): Promise<RecordResponseDto>;
  update(id: number, actorId: number, dto: UpdateRecordDto): Promise<RecordResponseDto>;
  delete(id: number): Promise<void>;
}