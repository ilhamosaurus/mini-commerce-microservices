import { NestFactory } from '@nestjs/core';
import { AccountModule } from './account.module';
import { RmqService } from '@app/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AccountModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('ACCOUNT'));
  await app
    .startAllMicroservices()
    .then(() => Logger.log('Account service is running 🚀'));
}
bootstrap();
