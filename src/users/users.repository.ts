import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUsersRepository } from './users.repository.interface';

type SortField = 'createdAt' | 'updatedAt' | 'name' | 'username' | 'email';

type SafeUser = Omit<User, 'password' | 'tokenVersion'>;

const safeSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<SafeUser> {
    // service already hashes password; we still only select safe fields
    return this.prisma.user.create({ data, select: safeSelect }) as Promise<SafeUser>;
  }

  async findById(id: number): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: safeSelect,
    }) as Promise<SafeUser | null>;
  }

  async findMany(params: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page: number;
    limit: number;
    sortBy: SortField;
    order: 'asc' | 'desc';
  }): Promise<{ data: SafeUser[]; total: number }> {
    const { search, role, status, page, limit, sortBy, order } = params;

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: safeSelect,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: data as SafeUser[], total };
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data,
        select: safeSelect,
      });
      return updated as SafeUser;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}