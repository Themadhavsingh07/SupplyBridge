import { prisma } from '@/lib/prisma';

export interface LogAIUsageParams {
  userId?: string;
  feature: string;
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
}

export async function logAIUsage(params: LogAIUsageParams): Promise<void> {
  if (!params.feature) return;

  try {
    const promptTokens = params.promptTokens ?? 0;
    const completionTokens = params.completionTokens ?? 0;
    const totalTokens = params.totalTokens ?? (promptTokens + completionTokens);

    await prisma.aIUsageLog.create({
      data: {
        userId: params.userId || undefined,
        feature: params.feature,
        provider: params.provider || 'BUILTIN_DETERMINISTIC',
        model: params.model || 'supplybridge-v1',
        promptTokens,
        completionTokens,
        totalTokens,
        latencyMs: params.latencyMs ?? 0,
        success: params.success,
        errorMessage: params.errorMessage ? params.errorMessage.slice(0, 250) : undefined,
      },
    });
  } catch (err) {
    // Non-blocking write: log clean 1-line warning if DB is unavailable
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[AIUsageLog] Could not persist AI log (${params.feature}):`, msg.split('\n')[0]);
  }
}
