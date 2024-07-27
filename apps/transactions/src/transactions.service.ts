import { Inject, Injectable } from '@nestjs/common';
import { TransactionReposirtory } from './transaction.reposiroty';
import { PRODUCT_SERVICE } from './constants/service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Account, TopupDto, TransactionType } from '@app/common';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionReposirtory,
    @Inject(PRODUCT_SERVICE) private productClient: ClientProxy,
  ) {}

  // async createOrder(dto: CreateOrderDto, authentication: string) {
  //   // const sessions = await this.transactionRepository.startTransaction();
  //   try {
  //     const order = await this.transactionRepository.create(dto);
  //     await lastValueFrom(
  //       this.productClient.emit('order_created', {
  //         order,
  //         Authentication: authentication,
  //       }),
  //     );
  //     // await sessions.commitTransaction();
  //     return order;
  //   } catch (error) {
  //     // await sessions.abortTransaction();
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  // async findOrders() {
  //   return this.transactionRepository.find({});
  // }

  async topup(dto: TopupDto, account: Account) {
    try {
      const invNumber = await this.getInvNumber(account);

      await this.transactionRepository.create({
        account_id: account._id,
        type: TransactionType.TOPUP,
        invoice: invNumber,
        amount: dto.amount,
      });
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getInvNumber(account: Account) {
    const today = new Date();
    const date = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate()}T00:00:00Z`;
    const count = await this.transactionRepository.count({
      account_id: account._id,
      created_at: { $gte: date },
    });

    const invDate = today.toJSON().slice(0, 10).split('-').reverse().join('');
    const invNumber = `INV${invDate}-${(count + 1).toString().padStart(3, '0')}`;
    return invNumber;
  }
}
