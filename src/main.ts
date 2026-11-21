import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();

const config = app.get<ConfigService<Env, true>>(ConfigService);
const port = config.get('PORT', { infer: true });
await app.listen(port);

const logger = new Logger('Bootstrap');
logger.log(`Listening on http://localhost:${port}`);
logger.log(`AI provider: ${config.get('AI_PROVIDER', { infer: true })}`);
