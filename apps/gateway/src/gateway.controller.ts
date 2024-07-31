import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import {
  RegisterDto,
  LoginDto,
  JwtGuard,
  TopupDto,
  RolesGuard,
  Roles,
  CreateProductDto,
  UpdateProductDto,
  PaymentDto,
} from '@app/common';
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['MERCHANT'])
  @Post('product')
  async createProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    return this.gatewayService.createProduct(dto, req.cookies?.Authentication);
  }

  @UseGuards(JwtGuard)
  @Get('product')
  async getProducts(@Req() req: Request) {
    return this.gatewayService.getProducts(req.cookies?.Authentication);
  }

  @UseGuards(JwtGuard)
  @Get('product/:id')
  async getProduct(@Req() req: Request, @Param('id') id: string) {
    return this.gatewayService.getProductById(id, req.cookies?.Authentication);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['MERCHANT'])
  @Patch('product/:id')
  async updateProduct(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.gatewayService.updateProduct(
      id,
      dto,
      req.cookies?.Authentication,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['MERCHANT'])
  @Delete('product/:id')
  async deleteProduct(@Req() req: Request, @Param('id') id: string) {
    return this.gatewayService.deleteProduct(id, req.cookies?.Authentication);
  }

  @UseGuards(JwtGuard)
  @Post('payment')
  async payment(@Body() dto: PaymentDto, @Req() req: Request) {
    return this.gatewayService.payment(dto, req.cookies?.Authentication);
  }

  @UseGuards(JwtGuard)
  @Get('transactions')
  async getTransactionsHistory(
    @Req() req: Request,
    @Query() query: { limit?: string; offset?: string },
  ) {
    return this.gatewayService.getTransactionsHistory(
      req.cookies?.Authentication,
      +query.limit,
      +query.offset,
    );
  }
}
