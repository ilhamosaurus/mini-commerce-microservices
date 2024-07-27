import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { RmqService } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('PRODUCT'));
  await app
    .startAllMicroservices()
    .then(() => Logger.log('Product service is running 🚀'));
}
bootstrap();
