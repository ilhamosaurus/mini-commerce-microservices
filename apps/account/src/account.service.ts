import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { TRANSACTIONS_SERVICE, User } from '@app/common';
import { TopupDto } from './dto/topup.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Account } from './schemas/account.schema';

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

      const result = this.fomater(account);

      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async payment(totalCost: number, buyerEmail: string, merchantEmail: string) {
    try {
      await this.accountRepository.findOneAndUpdate(
        { owner: buyerEmail },
        { $inc: { balance: -totalCost } },
      );
      await this.accountRepository.findOneAndUpdate(
        { owner: merchantEmail },
        { $inc: { balance: totalCost } },
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getBalance(user: User) {
    try {
      const account = await this.getAccount(user.email);

      const data = this.fomater(account);
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  private async fomater(account: Account) {
    const balance = account.balance.toString();

    const formater = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    });

    return {
      owner: account.owner,
      balance: formater.format(Number(balance)),
    };
  }
}
