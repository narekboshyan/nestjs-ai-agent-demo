import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { callTool } from '@nestjs/ai/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';

// Calls the agent functions the way a model's tool call does:
// schema, scopes, guards, then the method.
describe('order tools', () => {
  let app: INestApplication;

  before(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await moduleRef.createNestApplication().init();
  });
  after(() => app.close());

  const as = (role: string) => ({ caller: { request: { user: { id: 'u1', role } } } });

  it('find-order returns the order', async () => {
    const order = await callTool(app, 'find-order', { id: 'ord_1' }, as('customer'));
    assert.deepEqual(order, {
      id: 'ord_1',
      item: 'Mechanical keyboard',
      status: 'shipped',
      total: 129,
    });
  });

  it('find-order rejects input that does not match the schema', async () => {
    await assert.rejects(callTool(app, 'find-order', { id: 42 }, as('customer')));
  });

  it('refund is refused for a customer', async () => {
    await assert.rejects(
      callTool(app, 'refund', { id: 'ord_2' }, as('customer')),
      /Forbidden resource/,
    );
  });

  it('refund runs for a support user', async () => {
    const order = await callTool(app, 'refund', { id: 'ord_2' }, as('support'));
    assert.equal((order as { status: string }).status, 'refunded');
  });
});
