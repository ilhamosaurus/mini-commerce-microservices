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
  RegisterResponse,
  LoginDto,
  JwtGuard,
  TopupDto,
  RolesGuard,
  Roles,
  CreateProductDto,
  UpdateProductDto,
  PaymentDto,
  LoginResponse,
  GetBalanceReponse,
  ProductResponse,
  TransactionResponse,
} from '@app/common';
import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @ApiTags('Auth')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Successfully registered',
    type: RegisterResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid Body Request' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.gatewayService.register(dto);
  }

  @ApiTags('Auth')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponse, description: 'Login successfully' })
  @ApiBadRequestResponse({ description: 'Invalid Credentials' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    return this.gatewayService.login(dto, res);
  }

  @ApiTags('Transactions')
  @ApiCookieAuth('Authentication')
  @ApiOkResponse({
    type: GetBalanceReponse,
    description: 'Get Balance Response',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid Token' })
  @ApiNotFoundResponse({ description: "User's account not found" })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard)
  @Get('balance')
  async getBalance(@Req() req: Request) {
    return this.gatewayService.getBalance(req.cookies?.Authentication);
  }

  @ApiTags('Transactions')
  @ApiCookieAuth('Authentication')
  @ApiBody({ type: TopupDto })
  @ApiOkResponse({
    type: GetBalanceReponse,
    description: "User's updated balance",
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiBadRequestResponse({ description: 'Invalid Request Body' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard)
  @Post('topup')
  async topup(@Body() dto: TopupDto, @Req() req: Request) {
    return this.gatewayService.topup(dto, req.cookies?.Authentication);
  }

  @ApiTags('Products')
  @ApiCookieAuth('Authentication')
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    type: ProductResponse,
    description: 'Product created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid body request' })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiForbiddenResponse({ description: 'Forbidden Resource' })
  @ApiConflictResponse({ description: "Product's code already exists" })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['MERCHANT'])
  @Post('product')
  async createProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    return this.gatewayService.createProduct(dto, req.cookies?.Authentication);
  }

  @ApiTags('Products')
  @ApiCookieAuth('Authentication')
  @ApiOkResponse({
    type: [ProductResponse],
    description: 'List of Products Response',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard)
  @Get('product')
  async getProducts(@Req() req: Request) {
    return this.gatewayService.getProducts(req.cookies?.Authentication);
  }

  @ApiTags('Products')
  @ApiCookieAuth('Authentication')
  @ApiOkResponse({
    type: ProductResponse,
    description: 'Product Response',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard)
  @Get('product/:id')
  async getProduct(@Req() req: Request, @Param('id') id: string) {
    return this.gatewayService.getProductById(id, req.cookies?.Authentication);
  }

  @ApiTags('Products')
  @ApiCookieAuth('Authentication')
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    type: ProductResponse,
    description: 'Product updated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiForbiddenResponse({ description: 'Forbidden Resource' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid body request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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

  @ApiTags('Products')
  @ApiCookieAuth('Authentication')
  @ApiOkResponse({
    example: {
      message: 'Product deleted successfully',
    },
    description: 'Product deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiForbiddenResponse({ description: 'Forbidden Resource' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(['MERCHANT'])
  @Delete('product/:id')
  async deleteProduct(@Req() req: Request, @Param('id') id: string) {
    return this.gatewayService.deleteProduct(id, req.cookies?.Authentication);
  }

  @ApiTags('Transactions')
  @ApiCookieAuth('Authentication')
  @ApiBody({ type: PaymentDto })
  @ApiCreatedResponse({
    type: TransactionResponse,
    description: 'Transaction created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiBadRequestResponse({
    description: 'Invalid body request or insufficient balance',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @UseGuards(JwtGuard)
  @Post('payment')
  async payment(@Body() dto: PaymentDto, @Req() req: Request) {
    return this.gatewayService.payment(dto, req.cookies?.Authentication);
  }

  @ApiTags('Transactions')
  @ApiCookieAuth('Authentication')
  @ApiCreatedResponse({
    type: [TransactionResponse],
    description: 'List of Transactions Response',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid token' })
  @ApiNotFoundResponse({ description: 'No transactions found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
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
