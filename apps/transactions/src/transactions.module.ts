import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule, DatabaseModule, RmqModule, RmqService } from '@app/common';
import { TransactionReposirtory } from './transaction.reposiroty';
import { MongooseModule } from '@nestjs/mongoose';
import { PRODUCT_SERVICE } from './constants/service';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_TRANSACTIONS_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/transactions/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    RmqModule.register({
      names: [PRODUCT_SERVICE],
    }),
    AuthModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionReposirtory, RmqService],
})
export class TransactionsModule {}
