import { Controller, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { CurrentUser, JwtGuard, RmqService, User } from '@app/common';
import { TopupDto } from './dto/topup.dto';

@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('create_account')
  async createAccount(@Payload('user') user: User, @Ctx() ctx: RmqContext) {
    try {
      await this.accountService.createAccount(user);
      this.rmqService.ack(ctx);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern('get_balance')
  @UseGuards(JwtGuard)
  async getBalance(@CurrentUser() user: User, @Ctx() ctx: RmqContext) {
    const balance = await this.accountService.getBalance(user);
    this.rmqService.ack(ctx);

    return balance;
  }

  @MessagePattern('topup')
  @UseGuards(JwtGuard)
  async topUp(
    @CurrentUser() user: User,
    @Payload() payload: { dto: TopupDto; Authentication: string },
    @Ctx() ctx: RmqContext,
  ) {
    const account = await this.accountService.topUp(
      user,
      payload.dto,
      payload.Authentication,
    );

    this.rmqService.ack(ctx);

    return account;
  }
}
