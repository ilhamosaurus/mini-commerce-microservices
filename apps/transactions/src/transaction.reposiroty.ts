import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class TransactionReposirtory extends AbstractRepository<Transaction> {
  protected readonly logger = new Logger(TransactionReposirtory.name);

  constructor(
    @InjectModel(Transaction.name) transactionModel: Model<Transaction>,
    @InjectConnection() connection: Connection,
  ) {
    super(transactionModel, connection);
  }
}
