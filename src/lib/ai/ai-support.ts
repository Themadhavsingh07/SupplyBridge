import { getAIClient } from './ai-client';
import { executeAITool } from './ai-tools';
import { detectPromptInjection, sanitizeUserInput } from './ai-guardrails';
import { AIToolResult } from './ai-types';

export interface AISupportRequest {
  message: string;
  userId?: string;
  orderId?: string;
  complaintId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AISupportResponse {
  response: string;
  toolResults: AIToolResult[];
  escalateToHuman: boolean;
  escalationReason?: string;
}

const HUMAN_ESCALATION_KEYWORDS = [
  'human',
  'agent',
  'representative',
  'manager',
  'talk to support',
  'dispute',
  'fraud',
  'harassment',
  'damaged product',
  'damaged item',
  'missing order',
  'stolen',
  'police',
  'legal',
  'court',
  'lawyer',
  'threat',
  'cheat',
  'scam',
  'failed refund',
  'wrong deduction',
  'double charged',
];

export async function processAISupportQuery(request: AISupportRequest): Promise<AISupportResponse> {
  const sanitizedInput = sanitizeUserInput(request.message);

  // 1. Guardrail Check: Prompt Injection
  if (detectPromptInjection(sanitizedInput)) {
    return {
      response:
        "I am afraid I cannot process instructions that attempt to alter system security rules or access unauthorized information. How can I assist you with your SupplyBridge order or support inquiry today?",
      toolResults: [],
      escalateToHuman: false,
    };
  }

  // 2. Check for explicit human support escalation trigger
  const lowerInput = sanitizedInput.toLowerCase();
  const matchedKeyword = HUMAN_ESCALATION_KEYWORDS.find((kw) => lowerInput.includes(kw));
  let escalateToHuman = !!matchedKeyword;
  let escalationReason = matchedKeyword ? `Triggered by keyword: '${matchedKeyword}'` : undefined;

  const toolResults: AIToolResult[] = [];

  // 3. Determine if automated tool calls are needed based on user intent
  if (lowerInput.includes('order') || lowerInput.includes('status') || request.orderId) {
    const res = await executeAITool('getOrderStatus', { orderId: request.orderId }, request.userId);
    toolResults.push(res);
  }

  if (lowerInput.includes('track') || lowerInput.includes('delivery') || lowerInput.includes('rider')) {
    const res = await executeAITool('getDeliveryStatus', { orderId: request.orderId }, request.userId);
    toolResults.push(res);
  }

  if (lowerInput.includes('complaint') || lowerInput.includes('ticket') || request.complaintId) {
    const res = await executeAITool('getComplaintStatus', { complaintId: request.complaintId }, request.userId);
    toolResults.push(res);
  }

  // 4. Generate grounded natural language response using AI Client
  const client = getAIClient();
  const contextSummary = toolResults.length > 0 ? JSON.stringify(toolResults, null, 2) : 'No tools executed.';

  const systemInstruction = `You are SupplyBridge AI Support Assistant.
You MUST provide helpful, empathetic support grounded ONLY in the retrieved data or standard platform policies:
- Delivery ETA is quick-commerce (15-30 mins).
- Cancellations: Allowed before order is marked as PREPARING.
- Returns/Refunds: Damaged or wrong products eligible for full refund upon review.
- Support Hours: 24/7.
NEVER invent order statuses, transaction IDs, or payment details not present in tool results.
If information is unavailable or user demands human intervention, recommend clicking 'Talk to Support'.`;

  const userPrompt = `User Inquiry: "${sanitizedInput}"\nRetrieved Tool Data: ${contextSummary}\nEscalate to human suggested: ${escalateToHuman}`;

  const aiRes = await client.generateText(`${systemInstruction}\n\n${userPrompt}`);
  const responseText = typeof aiRes === 'string' ? aiRes : aiRes.text;

  return {
    response: responseText,
    toolResults,
    escalateToHuman,
    escalationReason,
  };
}
