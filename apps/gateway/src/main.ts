import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const config = app.get(ConfigService);
  const globalPrefix = 'api';
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  const PORT = config.get('PORT') || 3000;

  const swgConfig = new DocumentBuilder()
    .setTitle('Microservices in NestJS')
    .setDescription(
      'Mini commerce API built using microservice architecture with RabbitMQ and MongoDB.',
    )
    .setContact(
      'Ilhamosaurus',
      'https://github.com/ilhamosaurus',
      'ilhamsssa@gmail.com',
    )
    .addCookieAuth('Authentication')
    .setVersion('1.0.0')
    .build();

  const options: SwaggerDocumentOptions = {
    ignoreGlobalPrefix: false,
  };
  const customOption: SwaggerCustomOptions = {
    useGlobalPrefix: true,
  };

  const document = SwaggerModule.createDocument(app, swgConfig, options);
  SwaggerModule.setup('docs', app, document, customOption);

  await app
    .listen(PORT)
    .then(() =>
      Logger.log(
        `Gateway service is running on: http://localhost:${PORT}/${globalPrefix}`,
      ),
    );
}
bootstrap();
