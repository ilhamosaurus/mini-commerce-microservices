import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthModule,
  DatabaseModule,
  RmqModule,
  RmqService,
  TRANSACTIONS_SERVICE,
} from '@app/common';
import { Account, AccountSchema } from './schemas/account.schema';
import { AccountRepository } from './account.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_ACCOUNT_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/account/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    AuthModule,
    RmqModule.register({ names: [TRANSACTIONS_SERVICE] }),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository, RmqService],
})
export class AccountModule {}
