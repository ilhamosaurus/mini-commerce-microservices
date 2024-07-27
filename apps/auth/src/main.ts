import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('AUTH', true));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app
    .startAllMicroservices()
    .then(() => Logger.log('Auth microsevice service is running 🚀'));
}
bootstrap();
