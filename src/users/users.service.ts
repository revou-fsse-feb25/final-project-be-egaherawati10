import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { IUsersService } from './users.service.interface';
import {
  IUsersRepository,
  SafeUser,
  SortField,
} from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const ALLOWED_SORT_FIELDS: SortField[] = [
  'createdAt',
  'updatedAt',
  'name',
  'username',
  'email',
];

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('IUsersRepository') private readonly repo: IUsersRepository,
  ) {}

  /** repo already returns safe users */
  private toResponse(u: SafeUser): UserResponseDto {
    return u as unknown as UserResponseDto;
  }

  private mapPrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const t = e.meta?.target;
        const target = Array.isArray(t) ? t.join(', ') : (t as string) ?? 'unique field';
        throw new ConflictException(`Duplicate value for ${target}`);
      }
      if (e.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
    }
    throw e;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const password = await bcrypt.hash(dto.password, 10);

      const created = await this.repo.create({
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password,
        role: dto.role as UserRole,
        status: (dto.status ?? 'active') as UserStatus,
      });

      return this.toResponse(created);
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async findMany(q: QueryUserDto) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));

    const rawSortBy = (q.sortBy as SortField | undefined) ?? 'createdAt';
    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(rawSortBy)
      ? rawSortBy
      : 'createdAt';

    const order = (q.order ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const { data, total } = await this.repo.findMany({
      search: q.search,
      role: q.role as UserRole | undefined,
      status: q.status as UserStatus | undefined,
      page,
      limit,
      sortBy,
      order,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      data: data.map((u) => this.toResponse(u)),
      meta: { page, limit, total, totalPages, sortBy, order },
    };
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const data: Partial<User> = { ...dto } as any;

      if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
      if (dto.role) data.role = dto.role as UserRole;
      if (dto.status) data.status = dto.status as UserStatus;

      const updated = await this.repo.update(id, data);
      if (!updated) throw new NotFoundException('User not found');
      return this.toResponse(updated);
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const ok = await this.repo.delete(id);
      if (!ok) throw new NotFoundException('User not found');
    } catch (e) {
      this.mapPrismaError(e);
    }
  }
}