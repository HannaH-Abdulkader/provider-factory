import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './config/env';
import 'dotenv/config';

async function bootstrap(): Promise<void> {
  
  const cfg = loadConfig();

  const app = await NestFactory.create(AppModule);
  await app.listen(cfg.PORT);
  console.log(`listening on port ${cfg.PORT}`);
}

bootstrap();