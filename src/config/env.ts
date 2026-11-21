import * as z from 'zod';

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    /** `demo` answers with a scripted model and needs no key. */
    AI_PROVIDER: z.enum(['demo', 'anthropic']).default('demo'),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_MODEL: z.string().min(1).default('claude-opus-5-5'),
  })
  .refine((env) => env.AI_PROVIDER !== 'anthropic' || env.ANTHROPIC_API_KEY, {
    message: 'ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic',
    path: ['ANTHROPIC_API_KEY'],
  });

export type Env = z.infer<typeof envSchema>;

/** Passed to `ConfigModule.forRoot({ validate })`: the app refuses to start on bad configuration. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
