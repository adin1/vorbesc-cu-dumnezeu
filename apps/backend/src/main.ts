import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { ProductionExceptionFilter } from './common/filters/production-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV', 'development') === 'production';
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const jwtSecret = configService.get<string>('JWT_SECRET', '');

  if (isProduction && (!jwtSecret || jwtSecret.includes('change-me'))) {
    throw new Error('JWT_SECRET este invalid pentru producție. Setează o valoare puternică.');
  }

  app.enableCors({ origin: frontendUrl.split(',').map((item) => item.trim()), credentials: true });
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  if (isProduction) {
    app.useGlobalFilters(new ProductionExceptionFilter());
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}

bootstrap();
