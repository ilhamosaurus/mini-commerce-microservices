import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { RegisterDto, LoginDto, JwtGuard, TopupDto } from '@app/common';
import { Request, Response } from 'express';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.gatewayService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    return this.gatewayService.login(dto, res);
  }

  @UseGuards(JwtGuard)
  @Get('balance')
  async getBalance(@Req() req: Request) {
    return this.gatewayService.getBalance(req.cookies?.Authentication);
  }

  @UseGuards(JwtGuard)
  @Post('topup')
  async topup(@Body() dto: TopupDto, @Req() req: Request) {
    return this.gatewayService.topup(dto, req.cookies?.Authentication);
  }
}
