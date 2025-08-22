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
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

type SafeUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  private accessTtl() {
    return this.cfg.get<string>('JWT_ACCESS_TTL') ?? '15m';
  }
  private accessSecret() { 
    return this.cfg.getOrThrow<string>('JWT_ACCESS_SECRET'); 
  }

  /** Sign an access token embedding tokenVersion and a fresh jti */
  private async signAccessToken(userId: number) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, tokenVersion: true, status: true },
    });
    if (!u) throw new NotFoundException('User not found');
    if (u.status !== UserStatus.active) throw new ForbiddenException('Account is not active');

    const payload = {
      sub: u.id,
      role: u.role,
      tv: u.tokenVersion,
      jti: crypto.randomUUID(),
      typ: 'access' as const,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessSecret(),
      expiresIn: this.accessTtl(),
    });
  }

  /** Create a new user; default status=active. */
  async register(data: RegisterDto) {
    const username = data.username.trim().toLowerCase();
    const email = data.email.trim().toLowerCase();
    const hash = await bcrypt.hash(data.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          username,
          email,
          password: hash,
          role: (data as any).role ?? UserRole.patient,
          status: UserStatus.active,
        },
        select: {
          id: true, name: true, username: true, email: true,
          role: true, status: true, createdAt: true, updatedAt: true,
        },
      });
      return { message: 'Registration successful', user };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Username or email already exists');
      }
      throw e;
    }
  }

  async validateUser(usernameOrEmail: string, password: string): Promise<SafeUser | null> {
    const key = usernameOrEmail.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: key }, { email: key }] },
    });
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    if (user.status !== UserStatus.active) {
      throw new UnauthorizedException('Account is suspended');
    }

    const { password: _pw, ...safe } = user as any;
    return safe as SafeUser;
  }

  /** Called by AuthController after Local guard sets req.user */
  async login(user: SafeUser) {
    const access_token = await this.signAccessToken(user.id);
    return { access_token };
  }

  async logout(_userId: number) {
    return { message: 'Logged out successfully' };
  }

  /** Simple profile lookup */
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