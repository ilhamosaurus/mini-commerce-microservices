import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const config = app.get(ConfigService);
  const globalPrefix = 'api';
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  const PORT = config.get('PORT') || 3000;
  await app
    .listen(PORT)
    .then(() =>
      Logger.log(
        `Gateway service is running on: http://localhost:${PORT}/${globalPrefix}`,
      ),
    );
}
bootstrap();
