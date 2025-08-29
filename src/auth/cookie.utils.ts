import type { CookieOptions } from 'express';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const isProd = process.env.NODE_ENV === 'production';

export const accessCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: isProd,                 // Railway => true
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000,         // 15 menit
};

export const refreshCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
};