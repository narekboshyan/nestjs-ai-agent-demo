import { createAnthropic } from '@ai-sdk/anthropic';
import type { AiModuleOptions } from '@nestjs/ai';
import type { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { createDemoModel } from './demo-model.js';

/** Builds the `AiModule` options from validated configuration. */
export function createAiOptions(config: ConfigService<Env, true>): AiModuleOptions {
  const model =
    config.get('AI_PROVIDER', { infer: true }) === 'anthropic'
      ? createAnthropic({ apiKey: config.get('ANTHROPIC_API_KEY', { infer: true }) })(
          config.get('ANTHROPIC_MODEL', { infer: true }),
        )
      : createDemoModel();

  return {
    models: { default: model },
    defaults: {
      timeout: '30s',
      retry: { attempts: 3 },
      // Limits on what one request may spend.
      maxSteps: 5,
      budget: { maxTokens: 20_000 },
    },
  };
}
