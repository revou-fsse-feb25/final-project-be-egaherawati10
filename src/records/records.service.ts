import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IRecordsService, UserCtx } from './records.service.interface';
import { IRecordsRepository } from './records.repository.interface';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import { RecordResponseDto } from './dto/record-response.dto';

type SortField = 'createdAt' | 'updatedAt';
const ALLOWED_SORT_FIELDS: SortField[] = ['createdAt', 'updatedAt'];

@Injectable()
export class RecordsService implements IRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IRecordsRepository') 
    private readonly repo: IRecordsRepository,
  ) {}

  private toDto(x: any): RecordResponseDto {
    return x as RecordResponseDto;
  }

  private async getMRPatientId(medicalRecordId: number): Promise<number> {
    const mr = await this.prisma.medicalRecord.findFirst({
      where: { id: medicalRecordId, deletedAt: null },
      select: { id: true, patientId: true },
    });
    if (!mr) throw new NotFoundException('Medical record not found');
    return mr.patientId;
  }

  private async assertPatientScope(user: UserCtx, patientId: number) {
    if (user.role !== 'patient') return;
    const me = await this.prisma.patientProfile.findFirst({
      where: { userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== patientId) throw new NotFoundException('Record not found');
  }

  private async assertDoctorId(doctorId: number) {
    const d = await this.prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true },
    });
    if (!d || d.role !== 'doctor') {
      throw new BadRequestException('doctorId must reference a doctor user');
    }
  }

  // POST /medical-records/:medicalRecordId/records
  async createForMedicalRecord(
    medicalRecordId: number,
    actor: UserCtx,
    dto: CreateRecordDto,
  ) {
    const patientId = await this.getMRPatientId(medicalRecordId);

    const doctorId =
      dto.doctorId ?? (actor.role === 'doctor' ? actor.id : undefined);
    if (!doctorId) throw new BadRequestException('doctorId is required');
    await this.assertDoctorId(doctorId);

    const created = await this.repo.create({
      medicalRecord: { connect: { id: medicalRecordId } },
      patient: { connect: { id: patientId } },
      doctor: { connect: { id: doctorId } },
      subjective: dto.subjective ?? null,
      objective: dto.objective ?? null,
      assessment: dto.assessment ?? null,
      planning: dto.planning ?? null,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });

    return this.toDto(created);
  }

  // GET /medical-records/:medicalRecordId/records
  async listForMedicalRecord(
    medicalRecordId: number,
    q: QueryRecordDto,
    currentUser: UserCtx,
  ) {
    const patientId = await this.getMRPatientId(medicalRecordId);
    await this.assertPatientScope(currentUser, patientId);

    const where: Prisma.RecordWhereInput = {
      medicalRecordId,
      patientId,
      deletedAt: null,
      ...(q.search
        ? {
            OR: [
              { subjective: { contains: q.search, mode: 'insensitive' } },
              { objective: { contains: q.search, mode: 'insensitive' } },
              { assessment: { contains: q.search, mode: 'insensitive' } },
              { planning: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const rawSortBy = (q.sortBy as SortField | undefined) ?? 'createdAt';
    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(rawSortBy)
      ? rawSortBy
      : 'createdAt';
    const order = (q.order ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const { data, total } = await this.repo.findMany({
      where,
      page,
      limit,
      sortBy,
      order,
    });

    return {
      data: data.map((x) => this.toDto(x)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        sortBy,
        order,
      },
    };
  }

  // GET /records/:id
  async findById(id: number, currentUser: UserCtx) {
    const rec = await this.repo.findById(id);
    if (!rec) throw new NotFoundException('Record not found');
    await this.assertPatientScope(currentUser, rec.patientId);
    return this.toDto(rec);
  }

  // PATCH /records/:id
  async update(id: number, actorId: number, dto: UpdateRecordDto) {
    if (dto.doctorId) await this.assertDoctorId(dto.doctorId);

    const data: Prisma.RecordUpdateInput = {
      ...(dto.doctorId !== undefined
        ? { doctor: { connect: { id: dto.doctorId } } }
        : {}),
      ...(dto.subjective !== undefined ? { subjective: dto.subjective } : {}),
      ...(dto.objective !== undefined ? { objective: dto.objective } : {}),
      ...(dto.assessment !== undefined ? { assessment: dto.assessment } : {}),
      ...(dto.planning !== undefined ? { planning: dto.planning } : {}),
      updatedBy: { connect: { id: actorId } },
    };

    const updated = await this.repo.update(id, data);
    return this.toDto(updated);
  }

  // DELETE /records/:id (soft)
  async delete(id: number) {
    await this.repo.softDelete(id);
  }
}