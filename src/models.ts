import { anthropic } from '@ai-sdk/anthropic';
import { FakeModel, type FakeAnswer, type FakeModelCall } from '@nestjs/ai/testing';
import type { LanguageModel } from 'ai';

/**
 * A scripted stand-in for a real model, so the demo runs without an API key.
 * First call: asks for a tool. Second call: turns the tool result into an answer.
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

export function defaultModel(): LanguageModel {
  return process.env.ANTHROPIC_API_KEY
    ? anthropic('claude-opus-5-5')
    : new FakeModel(scriptedAnswer);
}
