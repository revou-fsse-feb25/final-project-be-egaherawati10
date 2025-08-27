import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('EMR API')
    .setDescription('Electronic Medical Record REST API')
    .setVersion('1.0.0')
    .addServer('/api/v1') // 👈 match the global prefix
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'jwt'
    )
    .build();

  const doc = SwaggerModule.createDocument(app, config, { deepScanRoutes: true });

  SwaggerModule.setup('docs', app, doc, {
    swaggerOptions: { persistAuthorization: true },
    jsonDocumentUrl: 'docs/swagger.json',
    customSiteTitle: 'EMR API Docs',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();