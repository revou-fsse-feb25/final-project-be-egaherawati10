import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';

function toOrigin(urlOrHost: string): string | null {
  try {
    const u = new URL(urlOrHost);
    // normalize to scheme://host[:port]
    return `${u.protocol}//${u.host}`;
  } catch {
    // Might be just a host header value (no scheme)
    if (urlOrHost) return `//${urlOrHost}`; // scheme-less sentinel
    return null;
  }
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private isSafeMethod(method: string) {
    const m = (method || 'GET').toUpperCase();
    return m === 'GET' || m === 'HEAD' || m === 'OPTIONS';
  }

  private configuredAllowedOrigins(reqHostOrigin: string | null): Set<string> {
    const list =
      process.env.CSRF_ALLOWED_ORIGINS ??
      process.env.CORS_ORIGINS ??
      '';

    const s = new Set<string>(
      list
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => toOrigin(x) ?? x),
    );

    // If nothing configured, allow same-origin (request host) by default
    if (s.size === 0 && reqHostOrigin) s.add(reqHostOrigin);
    return s;
  }

  private originOk(req: any): boolean {
    // Derive request's own origin from Host + protocol
    const proto =
      (req.headers['x-forwarded-proto'] as string) ||
      (req.protocol as string) ||
      'http';
    const host = req.headers['x-forwarded-host'] || req.headers['host'];
    const reqOrigin = host ? `${proto}://${host}` : null;

    const allowed = this.configuredAllowedOrigins(reqOrigin);

    // Browser supplies Origin on CORS; otherwise use Referer
    const raw = (req.headers['origin'] as string) || (req.headers['referer'] as string) || '';
    if (!raw) return true; // non-browser clients (CLI/tests)

    const theirOrigin = toOrigin(raw);
    if (!theirOrigin) return true; // be permissive if unparsable

    // Exact origin match
    if (allowed.has(theirOrigin)) return true;

    // Support scheme-less matches defined by config
    if (allowed.has(theirOrigin.replace(/^https?:/, ''))) return true;

    return false;
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    if (this.isSafeMethod(req.method)) return true;

    // 1) Same-origin check
    if (!this.originOk(req)) {
      throw new ForbiddenException('Bad Origin/Referer');
    }

    // 2) Double-submit check (csrf cookie MUST be non-HttpOnly)
    const headerToken = (req.headers['x-csrf-token'] as string) || '';
    const cookieToken = req.cookies?.['csrf'] as string;
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}