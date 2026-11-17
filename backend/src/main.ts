import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/app-logger';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { requestLogger } from './common/request-logger';

async function bootstrap() {
  const logger = new AppLogger('Bootstrap');
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    logger.error('CONFIG_MISSING', 'Faltan variables de entorno obligatorias', { missing });
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.enableCors({ origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',') });
  app.use(requestLogger);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  logger.info('APP_STARTED', 'API de AgroHuila Conecta iniciada', { port, nodeEnv: process.env.NODE_ENV ?? 'development' });
}
bootstrap();
