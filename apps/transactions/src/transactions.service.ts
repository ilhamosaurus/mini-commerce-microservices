import { Inject, Injectable } from '@nestjs/common';
import { TransactionReposirtory } from './transaction.reposiroty';
import { PRODUCT_SERVICE } from './constants/service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  Account,
  ACCOUNT_SERVICE,
  PaymentDto,
  Product,
  TopupDto,
  TransactionType,
  User,
} from '@app/common';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionReposirtory,
    @Inject(PRODUCT_SERVICE) private productClient: ClientProxy,
    @Inject(ACCOUNT_SERVICE) private accountClient: ClientProxy,
  ) {}

  async topup(dto: TopupDto, account: Account) {
    try {
      console.log('dto: ', dto);
      console.log('account: ', account);
      const invNumber = await this.getInvNumber(account);
      console.log('invNumber: ', invNumber);
      const transaction = await this.transactionRepository.create({
        account_id: account._id,
        type: TransactionType.TOPUP,
        invoice: invNumber,
        amount: dto.amount,
      });
      console.log('transaction:', transaction);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async payment(user: User, dto: PaymentDto, authentication: string) {
    const session = await this.transactionRepository.startTransaction();
    try {
      const product: Product = await lastValueFrom(
        this.productClient
          .send('get_product_by_code', {
            code: dto.product_code.toUpperCase(),
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              if (val.code === 404) {
                return throwError(
                  () =>
                    new RpcException({
                      message: 'Product not found',
                      code: 404,
                    }),
                );
              }

              return throwError(() => new RpcException(val));
            }),
          ),
      );

      const buyerAccount: Account = await lastValueFrom(
        this.accountClient
          .send('get_account_by_email', {
            email: user.email,
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              if (val.code === 404) {
                return throwError(
                  () =>
                    new RpcException({
                      message: 'Account not found',
                      code: 404,
                    }),
                );
              }

              return throwError(() => new RpcException(val));
            }),
          ),
      );

      const merchantAccount: Account = await lastValueFrom(
        this.accountClient
          .send('get_account_by_email', {
            email: product.merchant,
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              if (val.code === 404) {
                return throwError(
                  () =>
                    new RpcException({
                      message: 'Account not found',
                      code: 404,
                    }),
                );
              }

              return throwError(() => new RpcException(val));
            }),
          ),
      );

      const buyerInvNumber = await this.getInvNumber(buyerAccount);
      const merchantInvNumber = await this.getInvNumber(merchantAccount);
      const totalCost = product.price * dto.qty;
      if (Number(buyerAccount.balance.$numberDecimal) < totalCost) {
        throw new RpcException({ message: 'Insufficient balance', code: 400 });
      }

      const transaction = await this.transactionRepository.create({
        account_id: buyerAccount._id,
        type: TransactionType.PAYMENT,
        invoice: buyerInvNumber,
        amount: totalCost,
        buyer: user.email,
        merchant: product.merchant,
        description: `Payment for product ${product.name} from ${product.merchant}`,
      });

      await this.transactionRepository.create({
        account_id: merchantAccount._id,
        type: TransactionType.REVENUE,
        invoice: merchantInvNumber,
        amount: totalCost,
        buyer: user.email,
        merchant: product.merchant,
        description: `Payment for product ${product.name} from ${buyerAccount.owner}`,
      });

      await lastValueFrom(
        this.accountClient
          .emit('payment', {
            totalCost,
            buyerEmail: user.email,
            merchantEmail: merchantAccount.owner,
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              return throwError(() => new RpcException(val));
            }),
          ),
      );

      await session.commitTransaction();
      const result = this.formater(transaction);
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new RpcException(error);
    }
  }

  async getTransactions(
    user: User,
    authentication: string,
    limit?: number,
    offset?: number,
  ) {
    try {
      const account: Account = await lastValueFrom(
        this.accountClient
          .send('get_account_by_email', {
            email: user.email,
            Authentication: authentication,
          })
          .pipe(
            catchError((val) => {
              if (val.error.code === 404) {
                return throwError(
                  () =>
                    new RpcException({
                      message: 'Account not found',
                      code: 404,
                    }),
                );
              }

              return throwError(() => new RpcException(val));
            }),
          ),
      );

      if (limit && offset) {
        const transactions = await this.transactionRepository.paginatedFind(
          limit,
          offset,
          { account_id: account._id },
          { created_at: 'desc' },
        );

        return transactions.map((transaction) => this.formater(transaction));
      }

      const transactions = await this.transactionRepository.find({
        account_id: account._id,
      });

      return transactions.map((transaction) => this.formater(transaction));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getInvNumber(account: Account) {
    try {
      const today = new Date();
      const date = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(
          2,
          '0',
        )}-${today.getDate().toString().padStart(2, '0')}T00:00:00Z`;
      const count = await this.transactionRepository.count({
        account_id: account._id,
        created_at: { $gte: date },
      });

      const invDate = today.toJSON().slice(0, 10).split('-').reverse().join('');
      const invNumber = `INV${invDate}-${(count ? count + 1 : 1).toString().padStart(3, '0')}`;
      return invNumber;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  private formater(transaction: Transaction) {
    const amount = transaction.amount.toString();

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    });

    return {
      ...transaction,
      amount: formatter.format(Number(amount)),
    };
  }
}
