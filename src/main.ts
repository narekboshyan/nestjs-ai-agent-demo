import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);
const port = Number(process.env.PORT ?? 3000);
await app.listen(port);
console.log(`Listening on http://localhost:${port}`);
console.log(
  process.env.ANTHROPIC_API_KEY
    ? 'Model: Anthropic (ANTHROPIC_API_KEY is set)'
    : 'Model: built-in fake model (set ANTHROPIC_API_KEY to use a real one)',
);
