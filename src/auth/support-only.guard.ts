import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { AiExecutionContext, type AiContextType } from '@nestjs/ai';

/** Lets a tool call through only when the model acts for a support user. */
@Injectable()
export class SupportOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.getType<AiContextType>() !== 'ai') {
      return true;
    }
    const call = AiExecutionContext.create(context);
    return call.getRequest()?.user?.role === 'support';
  }
}
