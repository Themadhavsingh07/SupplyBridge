import { z } from 'zod';

const booleanTransform = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    return s !== 'false' && s !== '0' && s !== 'disabled';
  }
  return true;
}, z.boolean());

const aiConfigSchema = z.object({
  AI_PROVIDER: z.enum(['OPENAI', 'GEMINI', 'ANTHROPIC', 'DETERMINISTIC', 'BUILTIN']).default('DETERMINISTIC'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('supplybridge-v1'),
  AI_MAX_TOKENS: z.coerce.number().default(1000),
  AI_TEMPERATURE: z.coerce.number().default(0.3),
  AI_TIMEOUT_MS: z.coerce.number().default(10000),
  AI_ENABLED: booleanTransform,
  // Feature flags
  AI_ASSISTANT: booleanTransform,
  SMART_SEARCH: booleanTransform,
  AI_RECOMMENDATIONS: booleanTransform,
  AI_CUSTOMER_SUPPORT: booleanTransform,
  AI_ANALYTICS: booleanTransform,
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

let parsedConfig: AIConfig | null = null;

export function getAIConfig(): AIConfig {
  if (parsedConfig) return parsedConfig;

  try {
    parsedConfig = aiConfigSchema.parse({
      AI_PROVIDER: process.env.AI_PROVIDER,
      AI_API_KEY: process.env.AI_API_KEY,
      AI_MODEL: process.env.AI_MODEL,
      AI_MAX_TOKENS: process.env.AI_MAX_TOKENS,
      AI_TEMPERATURE: process.env.AI_TEMPERATURE,
      AI_TIMEOUT_MS: process.env.AI_TIMEOUT_MS,
      AI_ENABLED: process.env.AI_ENABLED ?? 'true',
      AI_ASSISTANT: process.env.AI_ASSISTANT ?? 'true',
      SMART_SEARCH: process.env.SMART_SEARCH ?? 'true',
      AI_RECOMMENDATIONS: process.env.AI_RECOMMENDATIONS ?? 'true',
      AI_CUSTOMER_SUPPORT: process.env.AI_CUSTOMER_SUPPORT ?? 'true',
      AI_ANALYTICS: process.env.AI_ANALYTICS ?? 'true',
    });
  } catch (err) {
    // Safe default fallback if env parsing fails
    parsedConfig = {
      AI_PROVIDER: 'DETERMINISTIC',
      AI_MODEL: 'supplybridge-v1',
      AI_MAX_TOKENS: 1000,
      AI_TEMPERATURE: 0.3,
      AI_TIMEOUT_MS: 10000,
      AI_ENABLED: true,
      AI_ASSISTANT: true,
      SMART_SEARCH: true,
      AI_RECOMMENDATIONS: true,
      AI_CUSTOMER_SUPPORT: true,
      AI_ANALYTICS: true,
    };
  }

  return parsedConfig;
}

export function isAIEnabled(): boolean {
  const config = getAIConfig();
  return config.AI_ENABLED;
}

export function isAIFeatureEnabled(
  feature: 'AI_ASSISTANT' | 'SMART_SEARCH' | 'AI_RECOMMENDATIONS' | 'AI_CUSTOMER_SUPPORT' | 'AI_ANALYTICS'
): boolean {
  const config = getAIConfig();
  if (!config.AI_ENABLED) return false;
  return config[feature] ?? true;
}
