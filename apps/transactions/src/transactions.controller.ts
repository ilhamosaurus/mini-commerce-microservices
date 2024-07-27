import { Controller, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Account, JwtGuard, RmqService, TopupDto } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly rmqService: RmqService,
  ) {}

  // @Post()
  // @UseGuards(JwtGuard)
  // async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
  //   return this.transactionsService.createOrder(
  //     dto,
  //     req.cookies?.Authentication,
  //   );
  // }

  // @Get()
  // async findOrders() {
  //   return this.transactionsService.findOrders();
  // }

  @EventPattern('topup')
  @UseGuards(JwtGuard)
  async topup(
    @Payload() payload: { dto: TopupDto; account: Account },
    @Ctx() ctx: RmqContext,
  ) {
    await this.transactionsService.topup(payload.dto, payload.account);
    this.rmqService.ack(ctx);
  }
}
