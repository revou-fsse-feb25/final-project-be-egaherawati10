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
import type { Request, Response, CookieOptions } from 'express';

import { Public } from '../common/auth/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// ===== Cookie config =====
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_SECURE =
  IS_PROD ? true : process.env.AUTH_COOKIE_SECURE === 'true';
const COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN || undefined;

const RAW_SAMESITE = String(
  process.env.AUTH_SAME_SITE ?? (IS_PROD ? 'none' : 'lax'),
).toLowerCase() as 'lax' | 'strict' | 'none';

// Browsers require Secure when SameSite=None
const COOKIE_SAMESITE =
  !COOKIE_SECURE && RAW_SAMESITE === 'none' ? 'lax' : RAW_SAMESITE;

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAMESITE,
  domain: COOKIE_DOMAIN, // undefined on localhost → no Domain attr
  path: '/',
};

function setAuthCookies(
  res: Response,
  access: string,
  refresh: string,
  accessTtlMs: number,
  refreshTtlMs: number,
) {
  res.cookie(ACCESS_COOKIE, access, { ...baseCookie, maxAge: accessTtlMs });
  res.cookie(REFRESH_COOKIE, refresh, { ...baseCookie, maxAge: refreshTtlMs });
}

function clearAuthCookies(res: Response) {
  // Must use same attributes to ensure deletion on all browsers
  res.clearCookie(ACCESS_COOKIE, baseCookie);
  res.clearCookie(REFRESH_COOKIE, baseCookie);
}

function getRefreshCookie(req: Request): string | undefined {
  // cookie-parser puts unsigned cookies on req.cookies and signed on req.signedCookies
  const anyReq = req as any;
  return anyReq?.cookies?.[REFRESH_COOKIE] ?? anyReq?.signedCookies?.[REFRESH_COOKIE];
}

// =========================

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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    const { access, refresh } = await this.authService.issueTokens(user.id);

    setAuthCookies(res, access, refresh, this.authService.accessTtlMs, this.authService.refreshTtlMs);
    return { user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Access token refreshed' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = getRefreshCookie(req);
    if (!token) throw new UnauthorizedException('No refresh token');

    const payload = await this.authService.verifyRefresh(token);
    const { access, refresh } = await this.authService.issueTokens(payload.sub);

    setAuthCookies(res, access, refresh, this.authService.accessTtlMs, this.authService.refreshTtlMs);
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOkResponse({ description: 'Clears cookies and revokes all sessions' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (req?.user?.id) {
      await this.authService.bumpTokenVersion(req.user.id); // invalidate all tokens
    }
    clearAuthCookies(res);
    return { ok: true };
  }

  @ApiCookieAuth(ACCESS_COOKIE)
  @Get('profile')
  @ApiOkResponse({ description: 'Current user profile' })
  async profile(@Req() req: any) {
    return this.authService.profile(req.user.id);
  }
}