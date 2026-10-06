const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /override\s+security/i,
  /show\s+me\s+other\s+users/i,
  /dump\s+database/i,
  /eval\(/i,
  /<script>/i,
];

// Simple in-memory rate-limiting tracker
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 20, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.expiresAt) {
    requestCounts.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  // Strip HTML tags and null bytes
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/\0/g, '')
    .trim();
}

export function detectPromptInjection(input: string): boolean {
  if (!input) return false;
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function truncateContext(text: string, maxChars: number = 4000): string {
  if (!text || text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '... [Truncated for token safety]';
}
