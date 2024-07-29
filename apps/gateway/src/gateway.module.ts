import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  ACCOUNT_SERVICE,
  AUTH_SERVICE,
  PRODUCT_SERVICE,
  RmqModule,
  TRANSACTIONS_SERVICE,
} from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/gateway/.env',
    }),
    RmqModule.register({
      names: [
        AUTH_SERVICE,
        ACCOUNT_SERVICE,
        PRODUCT_SERVICE,
        TRANSACTIONS_SERVICE,
      ],
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
