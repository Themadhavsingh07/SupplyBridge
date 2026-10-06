interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, reset: windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetAt - now };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.resetAt - now };
}
