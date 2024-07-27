import { NestFactory } from '@nestjs/core';
import { TransactionsModule } from './transactions.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(TransactionsModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('TRANSACTIONS'));
  app.useGlobalPipes(new ValidationPipe());
  await app
    .startAllMicroservices()
    .then(() => Logger.log('Transactions service is running 🚀'));
}
bootstrap();
