import { isAIFeatureEnabled } from './ai-config';
import { AIDisabledError, normalizeAIError } from './ai-errors';
import { logAIUsage } from './ai-usage';

export interface AIFallbackOptions<T> {
  feature: 'AI_ASSISTANT' | 'SMART_SEARCH' | 'AI_RECOMMENDATIONS' | 'AI_CUSTOMER_SUPPORT' | 'AI_ANALYTICS';
  userId?: string;
  aiAction: () => Promise<T>;
  fallbackAction: (error?: Error) => Promise<T>;
  providerName?: string;
  modelName?: string;
}

export async function executeWithAIFallback<T>(options: AIFallbackOptions<T>): Promise<{
  result: T;
  isFallback: boolean;
  error?: Error;
}> {
  const startTime = Date.now();
  const provider = options.providerName || 'builtin';
  const model = options.modelName || 'supplybridge-v1';

  // 1. Check feature flags
  if (!isAIFeatureEnabled(options.feature)) {
    const fallbackResult = await options.fallbackAction(new AIDisabledError(options.feature));
    return { result: fallbackResult, isFallback: true };
  }

  // 2. Try primary AI Action
  try {
    const result = await options.aiAction();
    const latencyMs = Date.now() - startTime;

    // Log success asynchronously
    logAIUsage({
      userId: options.userId,
      feature: options.feature,
      provider,
      model,
      latencyMs,
      success: true,
    });

    return { result, isFallback: false };
  } catch (rawError: unknown) {
    const latencyMs = Date.now() - startTime;
    const aiError = normalizeAIError(rawError);

    console.warn(`[AIFallback] AI feature ${options.feature} failed. Triggering deterministic fallback. Error:`, aiError.message);

    // Log failure asynchronously
    logAIUsage({
      userId: options.userId,
      feature: options.feature,
      provider,
      model,
      latencyMs,
      success: false,
      errorMessage: aiError.message,
    });

    // 3. Execute deterministic fallback
    const fallbackResult = await options.fallbackAction(aiError);
    return { result: fallbackResult, isFallback: true, error: aiError };
  }
}
