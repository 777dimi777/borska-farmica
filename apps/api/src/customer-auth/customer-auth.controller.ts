import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerCookieService } from './customer-cookie.service';
import { CustomerLoginDto, CustomerRegisterDto } from './dto/customer-auth.dto';
@ApiTags('Customer Auth')
@Controller('auth')
export class CustomerAuthController {
  constructor(
    private readonly auth: CustomerAuthService,
    private readonly cookies: CustomerCookieService,
  ) {}
  private metadata(req: Request) {
    return { userAgent: req.get('user-agent'), ipAddress: req.ip };
  }
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Register a customer and start a separate customer session',
  })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  async register(
    @Body() dto: CustomerRegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto, this.metadata(req));
    this.cookies.set(res, result.refreshToken);
    return result.response;
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Customer email/password login' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  async login(
    @Body() dto: CustomerLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto, this.metadata(req));
    this.cookies.set(res, result.refreshToken);
    return result.response;
  }
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = this.cookies.read(req);
    if (!raw) throw new UnauthorizedException('Invalid credentials.');
    const result = await this.auth.refresh(raw, this.metadata(req));
    this.cookies.set(res, result.refreshToken);
    return result.response;
  }
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(this.cookies.read(req));
    this.cookies.clear(res);
  }
}
