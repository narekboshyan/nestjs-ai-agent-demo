import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { AiService } from '@nestjs/ai';

@Controller()
export class SupportController {
  constructor(private readonly ai: AiService) {}

  /** Step 4: call the agent. The model decides when to call the tools. */
  @Post('ask')
  async ask(@Body() body: { question?: string }, @Req() request: unknown) {
    if (typeof body?.question !== 'string' || body.question.length === 0) {
      throw new BadRequestException('Send JSON like { "question": "Where is order ord_1?" }');
    }
    const result = await this.ai.generateText({
      instructions: 'You are a support assistant for an online store. Use the tools to look up orders.',
      prompt: body.question,
      tools: ['find-order', 'refund'],
      caller: { request },
    });
    return {
      answer: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      steps: result.steps.length,
    };
  }
}
