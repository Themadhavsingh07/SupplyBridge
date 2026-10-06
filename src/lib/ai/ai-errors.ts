export type AIErrorCode =
  | 'AI_DISABLED'
  | 'AI_CONFIGURATION_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'AI_TIMEOUT'
  | 'AI_RATE_LIMITED'
  | 'AI_INVALID_RESPONSE'
  | 'AI_INVALID_STRUCTURED_OUTPUT'
  | 'AI_SAFETY_BLOCKED'
  | 'AI_TOOL_ERROR'
  | 'AI_UNKNOWN_ERROR';

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  public readonly details?: unknown;

  constructor(
    code: AIErrorCode,
    message: string,
    options?: { statusCode?: number; isRetryable?: boolean; details?: unknown }
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.statusCode = options?.statusCode || 500;
    this.isRetryable = options?.isRetryable || false;
    this.details = options?.details;

    Object.setPrototypeOf(this, AIError.prototype);
  }
}

export class AIDisabledError extends AIError {
  constructor(featureName: string = 'AI Service') {
    super('AI_DISABLED', `${featureName} is currently disabled. Using fallback mechanism.`, {
      statusCode: 503,
      isRetryable: false,
    });
  }
}

export class AITimeoutError extends AIError {
  constructor(timeoutMs: number) {
    super('AI_TIMEOUT', `AI provider request timed out after ${timeoutMs}ms.`, {
      statusCode: 504,
      isRetryable: true,
    });
  }
}

export class AIRateLimitedError extends AIError {
  constructor(retryAfterSeconds: number = 60) {
    super('AI_RATE_LIMITED', `AI request rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`, {
      statusCode: 429,
      isRetryable: true,
      details: { retryAfterSeconds },
    });
  }
}

export class AIGuardrailError extends AIError {
  constructor(reason: string = 'Prompt injection or unsafe content detected.') {
    super('AI_SAFETY_BLOCKED', `AI request blocked by safety guardrails: ${reason}`, {
      statusCode: 400,
      isRetryable: false,
    });
  }
}

export function normalizeAIError(error: unknown): AIError {
  if (error instanceof AIError) return error;

  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
    return new AIRateLimitedError();
  }

  if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('aborted')) {
    return new AITimeoutError(10000);
  }

  if (msg.toLowerCase().includes('injection') || msg.toLowerCase().includes('blocked')) {
    return new AIGuardrailError(msg);
  }

  return new AIError('AI_PROVIDER_ERROR', 'AI provider encountered an error. Please try again.', {
    statusCode: 502,
    isRetryable: true,
    details: msg,
  });
}
