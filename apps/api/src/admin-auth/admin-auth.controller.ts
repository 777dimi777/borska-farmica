import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response, CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from './authenticated-request';
import { AdminProfileDto } from './dto/admin-profile.dto';
import { AdminAuthService } from './admin-auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly auth: AdminAuthService,
    private readonly config: ConfigService,
  ) {}
  private cookieOptions(): CookieOptions {
    const sameSite = this.config.getOrThrow<'lax' | 'strict' | 'none'>(
      'AUTH_COOKIE_SAME_SITE',
    );
    const secure = this.config.getOrThrow<boolean>('AUTH_COOKIE_SECURE');
    if (sameSite === 'none' && !secure)
      throw new Error('SameSite=None requires Secure cookies.');
    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/v1/admin/auth',
      maxAge: this.config.getOrThrow<number>('JWT_REFRESH_TTL') * 1000,
    };
  }
  private token(req: Request): string | undefined {
    return req.cookies?.[
      this.config.getOrThrow<string>('ADMIN_REFRESH_COOKIE_NAME')
    ] as string | undefined;
  }
  private metadata(req: Request) {
    return { userAgent: req.get('user-agent'), ipAddress: req.ip };
  }
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin login; sets an HttpOnly refresh cookie' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiTooManyRequestsResponse()
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.auth.login(dto, this.metadata(req));
    res.cookie(
      this.config.getOrThrow('ADMIN_REFRESH_COOKIE_NAME'),
      result.refreshToken,
      this.cookieOptions(),
    );
    return result.response;
  }
  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const token = this.token(req);
    if (!token) throw new UnauthorizedException('Invalid credentials.');
    const result = await this.auth.refresh(token, this.metadata(req));
    res.cookie(
      this.config.getOrThrow('ADMIN_REFRESH_COOKIE_NAME'),
      result.refreshToken,
      this.cookieOptions(),
    );
    return result.response;
  }
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(this.token(req));
    res.clearCookie(
      this.config.getOrThrow('ADMIN_REFRESH_COOKIE_NAME'),
      this.cookieOptions(),
    );
  }

  @Get('me')
  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth('admin-access')
  @ApiOkResponse({ type: AdminProfileDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  me(@CurrentAdmin() admin: AuthenticatedAdmin): AdminProfileDto {
    return admin;
  }
}
