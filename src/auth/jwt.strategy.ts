import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

type AccessPayload = {
  sub: number;
  role: string;
  tv: number;     // tokenVersion
  jti: string;
  typ?: 'access';
};

// Make sure this matches JwtFromRequestFunction<Request>
const cookieExtractor = (req: Request): string | null => {
  return (req as any)?.cookies?.access ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      // IMPORTANT: use ConfigService so the type is strictly `string`
      secretOrKey: cfg.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessPayload) {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, tokenVersion: true },
    });

    if (!user) throw new UnauthorizedException();
    if (user.status !== 'active') throw new ForbiddenException('Account is not active');
    if (user.tokenVersion !== payload.tv) throw new UnauthorizedException('Session revoked');

    // This object becomes req.user
    return { id: user.id, role: user.role, jti: payload.jti };
  }
}