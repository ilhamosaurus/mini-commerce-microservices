import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    RmqModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_PRODUCT_QUEUE: Joi.string().required(),
      }),
      envFilePath: 'apps/product/.env',
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
