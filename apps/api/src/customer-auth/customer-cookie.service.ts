import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
@Injectable()
export class CustomerCookieService {
  constructor(private readonly config: ConfigService) {}
  private name() {
    return this.config.getOrThrow<string>('CUSTOMER_REFRESH_COOKIE_NAME');
  }
  options(): CookieOptions {
    const sameSite = this.config.getOrThrow<'lax' | 'strict' | 'none'>(
        'CUSTOMER_COOKIE_SAME_SITE',
      ),
      secure = this.config.getOrThrow<boolean>('CUSTOMER_COOKIE_SECURE');
    if (sameSite === 'none' && !secure)
      throw new Error('SameSite=None requires Secure customer cookies.');
    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/v1/auth',
      maxAge: this.config.getOrThrow<number>('CUSTOMER_JWT_REFRESH_TTL') * 1000,
    };
  }
  read(req: Request) {
    return req.cookies?.[this.name()] as string | undefined;
  }
  set(res: Response, token: string) {
    res.cookie(this.name(), token, this.options());
  }
  clear(res: Response) {
    res.clearCookie(this.name(), this.options());
  }
}
