import { IAIProvider } from './ai-types';
import { BuiltInDeterministicAIProvider, ExternalOpenAIProvider } from './ai-provider';

export function getAIProvider(): IAIProvider {
  const providerType = (process.env.AI_PROVIDER || 'DETERMINISTIC').toUpperCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (providerType === 'OPENAI' && apiKey && apiKey !== 'mock-key') {
    return new ExternalOpenAIProvider(apiKey, model);
  }

  // Default to built-in deterministic provider (fast, reliable, 0 cost, 100% grounded)
  return new BuiltInDeterministicAIProvider();
}

export function getAIClient(): IAIProvider {
  return getAIProvider();
}
