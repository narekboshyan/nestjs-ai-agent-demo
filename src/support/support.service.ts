import { Injectable } from '@nestjs/common';
import { AiService } from '@nestjs/ai';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';

export interface SupportAnswer {
  answer: string;
  /** Names of the tools the model called, in order. */
  toolsUsed: string[];
}

@Injectable()
export class SupportService {
  constructor(private readonly ai: AiService) {}

  /** Runs the agent. The model decides when to call the tools; `caller` says who it acts for. */
  async ask(question: string, request: AuthenticatedRequest): Promise<SupportAnswer> {
    const result = await this.ai.generateText({
      label: 'support-ask',
      instructions:
        'You are a support assistant for an online store. Use the tools to look up orders.',
      prompt: question,
      tools: ['find-order', 'refund'],
      caller: { request },
    });
    return {
      answer: result.text,
      toolsUsed: result.toolCalls.map((call) => call.toolName),
    };
  }
}
