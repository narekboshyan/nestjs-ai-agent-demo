import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { AskDto } from './dto/ask.dto.js';
import { SupportService, type SupportAnswer } from './support.service.js';

// The pipe and the rate limit are bound here, not globally: global guards and
// pipes also run on the model's tool calls, where there is no HTTP request to throttle.
@Controller()
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  ask(@Body() body: AskDto, @Req() request: AuthenticatedRequest): Promise<SupportAnswer> {
    return this.support.ask(body.question, request);
  }
}
