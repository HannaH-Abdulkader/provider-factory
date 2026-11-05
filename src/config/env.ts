import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URL: z.string().startsWith('mongodb', 'MONGO_URL must start with mongodb'),
  RAW_DB: z.string().min(1).default('provider_raw'),
  TARGET_DB: z.string().min(1).default('provider_domain'),
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(32).default(4),
  BATCH_SIZE: z.coerce.number().int().min(1).max(10000).default(500),
  MAX_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid configuration: ${details}`);
  }
  return parsed.data;
}