import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('EMR API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie', name: 'access_token' })
    .addCookieAuth('refresh_token', { type: 'apiKey', in: 'cookie', name: 'refresh_token' })
    .build();

  const doc = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();