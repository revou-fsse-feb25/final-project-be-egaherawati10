import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from '../common/auth/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';

const cookieBase = {
  httpOnly: true,
  sameSite: (process.env.AUTH_SAME_SITE as 'lax' | 'none' | 'strict') ?? 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;

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

    res.cookie('access', access,  { ...cookieBase, path: '/',    maxAge: this.authService.accessTtlMs });
    res.cookie('refresh', refresh,{ ...cookieBase, path: '/api', maxAge: this.authService.refreshTtlMs });

    return { user }; // cookie-only contract
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Access token refreshed' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req as any).cookies?.refresh as string | undefined;
    if (!token) throw new UnauthorizedException('No refresh token');

    const payload = await this.authService.verifyRefresh(token);
    const { access, refresh } = await this.authService.issueTokens(payload.sub);

    res.cookie('access', access,  { ...cookieBase, path: '/',    maxAge: this.authService.accessTtlMs });
    res.cookie('refresh', refresh,{ ...cookieBase, path: '/api', maxAge: this.authService.refreshTtlMs });

    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth('access') // for Swagger clarity (cookie-auth app)
  @ApiOkResponse({ description: 'Clears cookies and revokes all sessions' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (req?.user?.id) {
      await this.authService.bumpTokenVersion(req.user.id); // logout ALL devices
    }
    // Make deletion explicit (path/samesite/secure) to avoid CDN/proxy quirks
    res.clearCookie('access',  { path: '/',   sameSite: cookieBase.sameSite, secure: cookieBase.secure });
    res.clearCookie('refresh', { path: '/api', sameSite: cookieBase.sameSite, secure: cookieBase.secure });
    return { ok: true };
  }

  @ApiCookieAuth('access') // cookie-based auth
  @Get('profile')
  @ApiOkResponse({ description: 'Current user profile' })
  async profile(@Req() req: any) {
    return this.authService.profile(req.user.id);
  }

  // --- (Optional) remove after debugging ---
  @Public()
  @Get('whoami-raw')
  whoamiRaw(@Req() req: any) {
    return { cookies: req.cookies ?? null, headers: req.headers };
  }
}