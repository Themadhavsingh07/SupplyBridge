import { getAIClient } from './ai-client';
import { AIComplaintClassificationResult } from './ai-types';

const ALLOWED_CATEGORIES = [
  'WRONG_PRODUCT',
  'DAMAGED_PRODUCT',
  'MISSING_PRODUCT',
  'LATE_DELIVERY',
  'PAYMENT',
  'SUPPLIER',
  'DELIVERY_PARTNER',
  'REFUND',
  'OTHER',
] as const;

const ALLOWED_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export async function classifyComplaintAI(
  subject: string,
  description: string
): Promise<AIComplaintClassificationResult> {
  const client = getAIClient();

  const fallbackResult: AIComplaintClassificationResult = {
    suggestedCategory: 'OTHER',
    suggestedPriority: 'MEDIUM',
    summary: subject || description.slice(0, 80),
    recommendedDepartment: 'Customer Operations',
  };

  try {
    const rawOutput = await client.classifyComplaint(subject, description);

    // Validate enum fields strictly on the server
    const category = ALLOWED_CATEGORIES.includes(rawOutput.suggestedCategory as any)
      ? rawOutput.suggestedCategory
      : 'OTHER';

    const priority = ALLOWED_PRIORITIES.includes(rawOutput.suggestedPriority as any)
      ? rawOutput.suggestedPriority
      : 'MEDIUM';

    return {
      suggestedCategory: category,
      suggestedPriority: priority,
      summary: rawOutput.summary || subject,
      recommendedDepartment: rawOutput.recommendedDepartment || 'Customer Support',
    };
  } catch (err) {
    return fallbackResult;
  }
}
