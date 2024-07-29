import { Controller, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  CreateProductDto,
  CurrentUser,
  JwtGuard,
  RmqService,
  Roles,
  RolesGuard,
  User,
} from '@app/common';

@UseGuards(JwtGuard)
@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly rmqService: RmqService,
  ) {}

  @MessagePattern('get_products')
  async getProducts(@Ctx() ctx: RmqContext) {
    const products = await this.productService.getProducts();
    this.rmqService.ack(ctx);

    return products;
  }

  @MessagePattern('get_product_by_code')
  async getProductByCode(
    @Payload('code') code: string,
    @Ctx() ctx: RmqContext,
  ) {
    const product = await this.productService.getProductByCode(code);
    this.rmqService.ack(ctx);

    return product;
  }

  @MessagePattern('get_product_by_id')
  async getProductById(@Payload('id') id: string, @Ctx() ctx: RmqContext) {
    const product = await this.productService.getProductById(id);
    this.rmqService.ack(ctx);

    return product;
  }

  @MessagePattern('create_product')
  @UseGuards(RolesGuard)
  @Roles(['MERCHANT'])
  async createProduct(
    @CurrentUser() user: User,
    @Payload('dto') dto: CreateProductDto,
    @Ctx() ctx: RmqContext,
  ) {
    const product = await this.productService.createProduct(user, dto);
    this.rmqService.ack(ctx);

    return product;
  }

  @MessagePattern('update_product')
  @UseGuards(RolesGuard)
  @Roles(['MERCHANT'])
  async updateProduct(
    @CurrentUser() user: User,
    @Payload() payload: { id: string; dto: CreateProductDto },
    @Ctx() ctx: RmqContext,
  ) {
    const product = await this.productService.updateProduct(
      payload.id,
      user,
      payload.dto,
    );
    this.rmqService.ack(ctx);

    return product;
  }

  @EventPattern('delete_product')
  @UseGuards(RolesGuard)
  @Roles(['MERCHANT'])
  async deleteProduct(
    @CurrentUser() user: User,
    @Payload('id') id: string,
    @Ctx() ctx: RmqContext,
  ) {
    await this.productService.deleteProduct(id, user);
    this.rmqService.ack(ctx);
  }
}
