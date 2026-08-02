import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
@Injectable()
export class CartCookieService {
  constructor(private readonly config: ConfigService) {}
  private name() {
    return this.config.getOrThrow<string>('CART_COOKIE_NAME');
  }
  private options(): CookieOptions {
    const sameSite = this.config.getOrThrow<'lax' | 'strict' | 'none'>(
        'CART_COOKIE_SAME_SITE',
      ),
      secure = this.config.getOrThrow<boolean>('CART_COOKIE_SECURE');
    if (sameSite === 'none' && !secure)
      throw new Error('SameSite=None requires Secure cart cookies.');
    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/v1',
      maxAge: this.config.getOrThrow<number>('CART_TTL_DAYS') * 86400000,
    };
  }
  read(req: Request) {
    return req.cookies?.[this.name()] as string | undefined;
  }
  set(res: Response, raw: string) {
    res.cookie(this.name(), raw, this.options());
  }
  migrateLegacy(res: Response, raw: string) {
    res.clearCookie(this.name(), { ...this.options(), path: '/api/v1/cart' });
    this.set(res, raw);
  }
  clear(res: Response) {
    res.clearCookie(this.name(), this.options());
    res.clearCookie(this.name(), { ...this.options(), path: '/api/v1/cart' });
  }
}
