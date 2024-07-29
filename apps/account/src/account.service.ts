import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { TRANSACTIONS_SERVICE, User } from '@app/common';
import { TopupDto } from './dto/topup.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    @Inject(TRANSACTIONS_SERVICE)
    private readonly transactionClient: ClientProxy,
  ) {}

  async createAccount(user: User) {
    return this.accountRepository.create({ owner: user.email, balance: 0 });
  }

  async getAccount(email: string) {
    return this.accountRepository.findOne({ owner: email });
  }

  async topUp(user: User, dto: TopupDto, authentication: string) {
    try {
      const account = await this.accountRepository.findOneAndUpdate(
        { owner: user.email },
        { $inc: { balance: dto.amount } },
      );

      this.transactionClient.emit('topup', {
        dto,
        account,
        Authentication: authentication,
      });

      return account;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async payment(totalCost: number, userEmail: string) {
    try {
      await this.accountRepository.findOneAndUpdate(
        { owner: userEmail },
        { $inc: { balance: -totalCost } },
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getBalance(user: User) {
    try {
      const account = await this.getAccount(user.email);

      return { owner: account.owner, balance: account.balance };
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
