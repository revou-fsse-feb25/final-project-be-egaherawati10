import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IPatientsRepository } from './patients.repository.interface';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

@Injectable()
export class PatientsService {
  constructor(
    // FIX: tokens were swapped before — repo should be injected into `repo`, Prisma into `prisma`
    @Inject('IPatientsRepository') private readonly repo: IPatientsRepository,
    private readonly prisma: PrismaService,
  ) {}

  private toResponse(x: any): PatientResponseDto {
    return x as PatientResponseDto;
  }

  private async assertUserIsPatient(userId: number) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!u) throw new BadRequestException('userId does not exist');
    if (u.role !== UserRole.patient) {
      // If you prefer auto-convert: await this.prisma.user.update({ where: { id: userId }, data: { role: UserRole.patient } })
      throw new BadRequestException('userId must be a patient user');
    }
  }

  private async assertClerkIfProvided(clerkId?: number | null) {
    if (clerkId == null) return;
    const c = await this.prisma.user.findUnique({
      where: { id: clerkId },
      select: { id: true, role: true },
    });
    if (!c) throw new BadRequestException('clerkId does not exist');
    if (c.role !== UserRole.registration_clerk) {
      throw new BadRequestException('clerkId must be a registration_clerk');
    }
  }

  async create(dto: CreatePatientDto): Promise<PatientResponseDto> {
    await this.assertUserIsPatient(dto.userId);
    await this.assertClerkIfProvided(dto.clerkId);

    try {
      const created = await this.repo.create({
        user: { connect: { id: dto.userId } },
        dob: new Date(dto.dob),
        gender: dto.gender,
        address: dto.address,
        phone: dto.phone,
        ...(dto.clerkId ? { clerk: { connect: { id: dto.clerkId } } } : {}),
      });
      return this.toResponse(created);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Patient profile already exists for this user');
      }
      if (e?.code === 'P2003') {
        throw new BadRequestException('Invalid foreign key');
      }
      throw e;
    }
  }

  // ==== READS: always scope to users with role=patient ====

  async findById(id: number): Promise<PatientResponseDto> {
    const row = await this.prisma.patientProfile.findFirst({
      where: { id, user: { role: UserRole.patient } }, // enforce role here
      include: {
        user: true,
        clerk: true,        // adjust to your schema if different
      },
    });
    if (!row) throw new NotFoundException('Patient not found');
    return this.toResponse(row);
  }

  async findMany(q: QueryPatientDto) {
    const page  = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(q.limit ?? 20)));
    const skip  = (page - 1) * limit;

    // NOTE: your DTO uses `search` (not `q`) — keep consistent
    const where: Prisma.PatientProfileWhereInput = {
      // deletedAt: null,      // uncomment if you use soft delete
      user: {
        role: UserRole.patient, // <== crucial filter
        // status: 'active',     // optionally ensure active users only
      },
      ...(q.search
        ? {
            OR: [
              { address: { contains: q.search, mode: 'insensitive' } },
              { phone: { contains: q.search, mode: 'insensitive' } },
              { user: { name:  { contains: q.search, mode: 'insensitive' } } },
              { user: { email: { contains: q.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(q.gender ? { gender: q.gender } : {}),
      ...(q.clerkId ? { clerkId: q.clerkId } : {}),
    };

    const orderBy: Prisma.PatientProfileOrderByWithRelationInput =
      q.sortBy
        ? { [q.sortBy]: q.order ?? 'desc' }
        : { createdAt: 'desc' };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.patientProfile.count({ where }),
      this.prisma.patientProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { user: true, clerk: true },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: rows.map(this.toResponse),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: skip + rows.length < total,
        hasPrev: page > 1,
      },
    };
  }

  // ==== WRITES: ensure the target row belongs to a patient ====

  async update(id: number, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    await this.assertClerkIfProvided(dto.clerkId as any);

    // ensure the record is for a patient user
    const exists = await this.prisma.patientProfile.findFirst({
      where: { id, user: { role: UserRole.patient } },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Patient not found');

    const data: Prisma.PatientProfileUpdateInput = {
      ...(dto.dob ? { dob: new Date(dto.dob) } : {}),
      ...(dto.gender ? { gender: dto.gender } : {}),
      ...(dto.address ? { address: dto.address } : {}),
      ...(dto.phone ? { phone: dto.phone } : {}),
      ...(dto.clerkId === null
        ? { clerk: { disconnect: true } }
        : dto.clerkId
        ? { clerk: { connect: { id: dto.clerkId } } }
        : {}),
    };

    const updated = await this.repo.update(id, data);
    return this.toResponse(updated);
  }

  async delete(id: number): Promise<void> {
    // ensure the record is for a patient user
    const exists = await this.prisma.patientProfile.findFirst({
      where: { id, user: { role: UserRole.patient } },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Patient not found');

    // recommended: soft delete; your repo supports it
    await this.repo.softDelete(id);
  }
}