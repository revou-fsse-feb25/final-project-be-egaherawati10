import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../common/auth/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_SECURE =
  IS_PROD ? true : process.env.AUTH_COOKIE_SECURE === 'true';
const COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN || undefined;

const RAW_SAMESITE = (process.env.AUTH_SAME_SITE ?? (IS_PROD ? 'none' : 'lax')) as
  | 'lax'
  | 'strict'
  | 'none';
const COOKIE_SAMESITE =
  !COOKIE_SECURE && RAW_SAMESITE === 'none' ? 'lax' : RAW_SAMESITE;

function setAuthCookies(res: Response, access: string, refresh: string, accessTtlMs: number, refreshTtlMs: number) {
  res.cookie('access_token', access, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    domain: COOKIE_DOMAIN, // undefined on localhost → no Domain attr
    path: '/',
    maxAge: accessTtlMs,
  });

  res.cookie('refresh_token', refresh, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: refreshTtlMs,
  });
}

function clearAuthCookies(res: Response) {
  const base = {
    sameSite: COOKIE_SAMESITE,
    secure: COOKIE_SECURE,
    domain: COOKIE_DOMAIN,
  } as const;

  res.clearCookie('access_token', { ...base, path: '/' });
  res.clearCookie('refresh_token', { ...base, path: '/' });
  res.clearCookie('refresh_token', { ...base, path: '/api/auth/refresh' });
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'User registered' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Logged in; cookies set' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    const { access, refresh } = await this.authService.issueTokens(user.id);

    setAuthCookies(res, access, refresh, this.authService.accessTtlMs, this.authService.refreshTtlMs);
    return { user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Access token refreshed' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token =
      (req as any).cookies?.refresh_token ??
      (req as any).signedCookies?.refresh_token;
    if (!token) throw new UnauthorizedException('No refresh token');

    const payload = await this.authService.verifyRefresh(token);
    const { access, refresh } = await this.authService.issueTokens(payload.sub);

    setAuthCookies(res, access, refresh, this.authService.accessTtlMs, this.authService.refreshTtlMs);
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth('access_token')
  @ApiOkResponse({ description: 'Clears cookies and revokes all sessions' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (req?.user?.id) {
      await this.authService.bumpTokenVersion(req.user.id); // invalidate all tokens
    }
    clearAuthCookies(res);
    return { ok: true };
  }

  @ApiCookieAuth('access_token')
  @Get('profile')
  @ApiOkResponse({ description: 'Current user profile' })
  async profile(@Req() req: any) {
    return this.authService.profile(req.user.id);
  }
}