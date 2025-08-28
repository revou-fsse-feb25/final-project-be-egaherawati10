import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

type SafeUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

function parseTtl(input: string | undefined, fallbackMs: number): number {
  if (!input) return fallbackMs;
  const m = /^\s*(\d+)\s*([smhdw]?)\s*$/i.exec(input);
  if (!m) return fallbackMs;
  const n = parseInt(m[1], 10);
  const unit = (m[2] || 'm').toLowerCase();
  const mult =
    unit === 's' ? 1000 :
    unit === 'm' ? 60 * 1000 :
    unit === 'h' ? 60 * 60 * 1000 :
    unit === 'd' ? 24 * 60 * 60 * 1000 :
    unit === 'w' ? 7 * 24 * 60 * 60 * 1000 :
    60 * 1000;
  return n * mult;
}

@Injectable()
export class AuthService {
  // initialize in the constructor (not here)
  private _accessTtlMs!: number;
  private _refreshTtlMs!: number;

  // expose via getters for the controller
  get accessTtlMs(): number { return this._accessTtlMs; }
  get refreshTtlMs(): number { return this._refreshTtlMs; }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {
    this._accessTtlMs = parseTtl(this.cfg.get<string>('ACCESS_TTL'), 15 * 60 * 1000);
    this._refreshTtlMs = parseTtl(this.cfg.get<string>('REFRESH_TTL'), 7 * 24 * 60 * 60 * 1000);
  }

  private toSafe(u: any): SafeUser {
    const { id, name, username, email, role, status } = u;
    return { id, name, username, email, role, status };
  }

  async register(dto: RegisterDto): Promise<SafeUser> {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }] },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Username or email already exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        password: hashed,
        role: dto.role,
        status: dto.status ?? UserStatus.active, // enum
      },
    });
    return this.toSafe(user);
  }

  async validateUser(usernameOrEmail: string, password: string): Promise<SafeUser> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== UserStatus.active) throw new ForbiddenException('Account is not active');
    return this.toSafe(user);
  }

  private signAccess(payload: { sub: number; role: string; tv: number; jti: string }) {
    return this.jwt.sign(
      { ...payload, typ: 'access' },
      {
        secret: this.cfg.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: Math.floor(this._accessTtlMs / 1000), // seconds
      },
    );
  }

  private signRefresh(payload: { sub: number; tv: number; jti: string }) {
    return this.jwt.sign(
      { ...payload, typ: 'refresh' },
      {
        secret: this.cfg.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: Math.floor(this._refreshTtlMs / 1000),
      },
    );
  }

  async issueTokens(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const jti = crypto.randomUUID();
    const access = this.signAccess({ sub: userId, role: user.role, tv: user.tokenVersion, jti });
    const refresh = this.signRefresh({ sub: userId, tv: user.tokenVersion, jti });
    return { access, refresh, role: user.role };
  }

  async verifyRefresh(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<any>(token, {
        secret: this.cfg.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (payload?.typ !== 'refresh') throw new UnauthorizedException('Invalid refresh type');

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { tokenVersion: true },
      });
      if (!user) throw new UnauthorizedException('Invalid user');
      if (user.tokenVersion !== payload.tv) throw new UnauthorizedException('Session revoked');

      return payload as { sub: number; tv: number; jti: string; typ: 'refresh' };
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }
  }

  async bumpTokenVersion(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
      select: { id: true },
    });
  }

  async profile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, username: true, email: true,
        role: true, status: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}