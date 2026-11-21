import 'reflect-metadata';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { FakeModel, overrideModels } from '@nestjs/ai/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';

describe('POST /ask', () => {
  let app: INestApplication;
  let url: string;
  const model = new FakeModel();

  before(async () => {
    const moduleRef = await overrideModels(Test.createTestingModule({ imports: [AppModule] }), {
      default: model,
    }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0);
    url = `${await app.getUrl()}/ask`;
  });
  after(() => app.close());

  const ask = (body: unknown, headers: Record<string, string> = {}) =>
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });

  it('answers through the find-order tool', async () => {
    model.reply(
      { toolCalls: [{ name: 'find-order', input: { id: 'ord_1' } }] },
      'Your keyboard has shipped.',
    );
    const response = await ask({ question: 'Where is order ord_1?' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      answer: 'Your keyboard has shipped.',
      toolsUsed: ['find-order'],
    });
    // What the model read back from the tool.
    assert.deepEqual(model.lastCall?.toolResults[0]?.output, {
      id: 'ord_1',
      item: 'Mechanical keyboard',
      status: 'shipped',
      total: 129,
    });
  });

  it('shows the model "Forbidden resource" when a customer asks for a refund', async () => {
    model.reply({ toolCalls: [{ name: 'refund', input: { id: 'ord_2' } }] }, 'I cannot do that.');
    const response = await ask({ question: 'Refund ord_2' });
    assert.equal(response.status, 200);
    assert.match(JSON.stringify(model.lastCall?.toolResults), /Forbidden resource/);
  });

  it('lets a support user refund', async () => {
    model.reply({ toolCalls: [{ name: 'refund', input: { id: 'ord_2' } }] }, 'Refunded.');
    const response = await ask({ question: 'Refund ord_2' }, { 'x-demo-role': 'support' });
    assert.equal(response.status, 200);
    assert.match(JSON.stringify(model.lastCall?.toolResults), /"status":"refunded"/);
  });

  it('rejects a body without a question', async () => {
    assert.equal((await ask({})).status, 400);
    assert.equal((await ask({ question: 'hi', extra: true })).status, 400);
  });
});
