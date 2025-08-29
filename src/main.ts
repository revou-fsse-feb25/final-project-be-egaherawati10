// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Global prefix
  app.setGlobalPrefix('api');

  // Cookies
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS: read allowed origins from env (comma-separated), fallback to localhost
  const fallback = ['http://localhost:3000', 'http://localhost:3001'];
  const allowed = (process.env.CORS_ORIGIN ?? fallback.join(','))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow CLI/tools
      if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  const adapter: any = app.getHttpAdapter();
  const instance = adapter?.getInstance?.();
  if (instance?.set) instance.set('trust proxy', 1);

  const swagger = new DocumentBuilder()
    .setTitle('EMR API')
    .setDescription('Electronic Medical Record REST API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie', name: 'access_token' })
    .addCookieAuth('refresh_token', { type: 'apiKey', in: 'cookie', name: 'refresh_token' })
    .build();

  const doc = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, doc, {
    swaggerOptions: { persistAuthorization: true },
    jsonDocumentUrl: 'docs/swagger.json',
    customSiteTitle: 'EMR API Docs',
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on :${port}`);
  Logger.log(`CORS allowed origins: ${allowed.join(', ') || '(none)'}`);
}

bootstrap();