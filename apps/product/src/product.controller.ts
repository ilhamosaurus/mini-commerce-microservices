import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly rmqService: RmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.productService.getHello();
  }

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.productService.order(data);
    this.rmqService.ack(context);
  }
}
