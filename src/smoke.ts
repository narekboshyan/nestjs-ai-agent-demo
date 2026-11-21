import 'reflect-metadata';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Starts the app on a random port and checks the three flows end to end.
delete process.env.ANTHROPIC_API_KEY;
const app = await NestFactory.create(AppModule, { logger: false });
await app.listen(0);
const url = `${await app.getUrl()}/ask`;

async function ask(question: string, role?: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(role ? { 'x-demo-role': role } : {}) },
    body: JSON.stringify({ question }),
  });
  return { status: response.status, body: await response.json() };
}

const found = await ask('Where is order ord_1?');
console.log('1. find-order        ', JSON.stringify(found.body.answer));
assert.equal(found.status, 201);
assert.match(found.body.answer, /Mechanical keyboard/);

const denied = await ask('Please refund ord_2');
console.log('2. refund as customer', JSON.stringify(denied.body.answer));
assert.match(denied.body.answer, /Forbidden resource/);

const refunded = await ask('Please refund ord_2', 'support');
console.log('3. refund as support ', JSON.stringify(refunded.body.answer));
assert.match(refunded.body.answer, /refunded/);

await app.close();
console.log('All three flows passed.');
