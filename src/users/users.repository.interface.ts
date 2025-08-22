// users.repository.interface.ts
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';

export type SafeUser = Omit<User, 'password' | 'tokenVersion'>;
export type SortField = 'createdAt' | 'updatedAt' | 'name' | 'username' | 'email';

export interface IUsersRepository {
  create(data: Prisma.UserCreateInput): Promise<SafeUser>;
  findById(id: number): Promise<SafeUser | null>;
  findMany(params: {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page: number;
    limit: number;
    sortBy: SortField;
    order: 'asc' | 'desc';
  }): Promise<{ data: SafeUser[]; total: number }>;
  update(id: number, data: Prisma.UserUpdateInput): Promise<SafeUser>;
  delete(id: number): Promise<boolean>;
}