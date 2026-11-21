import { FakeModel, type FakeAnswer, type FakeModelCall } from '@nestjs/ai/testing';

/**
 * A scripted stand-in for a real model, used when AI_PROVIDER=demo so the app
 * runs without an API key. First call: asks for a tool. Second call: turns the
 * tool result into an answer.
 */
function scriptedAnswer(call: FakeModelCall): FakeAnswer {
  const last = call.toolResults.at(-1);
  if (last) {
    return `Tool ${last.toolName} returned: ${JSON.stringify(last.output)}`;
  }
  const message = call.lastUserMessage ?? '';
  const id = message.match(/ord_\w+/)?.[0];
  if (!id) {
    return 'Please give me an order id such as ord_1.';
  }
  const name = /refund/i.test(message) ? 'refund' : 'find-order';
  return { toolCalls: [{ name, input: { id } }] };
}

export function createDemoModel(): FakeModel {
  return new FakeModel(scriptedAnswer);
}
