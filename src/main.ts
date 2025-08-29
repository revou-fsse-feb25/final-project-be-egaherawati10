// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// 👇 Interop-safe cookie-parser import
import * as cookieParserNS from 'cookie-parser';
const cookieParser: (...args: any[]) => any =
  // if ESM, function lives on .default; if CJS, the module itself is a function
  ((cookieParserNS as any).default ?? (cookieParserNS as any));

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const fallback = ['http://localhost:3000', 'http://localhost:3001'];
  const raw = (process.env.CORS_ORIGIN ?? fallback.join(',')).trim();
  const allowAll = raw === '*' || raw.toLowerCase() === 'true';
  const allowed = allowAll ? [] : raw.split(',').map(s => s.trim()).filter(Boolean);

  app.enableCors({
    origin: (origin, cb) => {
      if (allowAll || !origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // trust proxy so Secure cookies work behind Railway
  const instance: any = app.getHttpAdapter()?.getInstance?.();
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
}
bootstrap();