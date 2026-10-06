export type AIProviderType = 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'DETERMINISTIC';

export interface GroundedProduct {
  productId: string;
  supplierId: string;
  supplierName: string;
  name: string;
  price: number;
  availableStock: number;
  rating: number;
  imageUrl: string;
  rankingScore?: number;
  explanation?: string;
}

export interface AIShoppingParams {
  category?: string;
  keywords?: string[];
  maxPrice?: number;
  minPrice?: number;
  dietaryPreferences?: string[];
  maxDistanceKm?: number;
  minRating?: number;
  inStockOnly?: boolean;
}

export interface AIShoppingIntent {
  rawQuery: string;
  intent: 'PRODUCT_SEARCH' | 'SUPPLIER_SEARCH' | 'PRICE_COMPARE' | 'RECOMMENDATION' | 'GENERAL_QUESTION';
  constraints: AIShoppingParams;
  extractedKeywords: string[];
  explanation: string;
}

export interface AIToolCall {
  toolName: string;
  args: Record<string, any>;
}

export interface AIToolResult {
  toolName: string;
  success: boolean;
  data: any;
  error?: string;
}

export interface AISupportMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: AIToolCall[];
  toolResults?: AIToolResult[];
}

export interface AISupportResponse {
  message: string;
  escalated: boolean;
  escalationReason?: string;
  suggestedAction?: 'TALK_TO_HUMAN' | 'VIEW_ORDER' | 'TRACK_DELIVERY' | 'REQUEST_REFUND';
  toolResults?: AIToolResult[];
}

export interface AIComplaintClassificationResult {
  suggestedCategory: 'WRONG_PRODUCT' | 'DAMAGED_PRODUCT' | 'MISSING_PRODUCT' | 'LATE_DELIVERY' | 'PAYMENT' | 'SUPPLIER' | 'DELIVERY_PARTNER' | 'REFUND' | 'OTHER';
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  summary: string;
  confidenceScore?: number;
  recommendedDepartment?: string;
}

export interface AIAnalyticsInsightItem {
  id: string;
  title: string;
  type: 'WARNING' | 'OPPORTUNITY' | 'ALERT' | 'INFO';
  insight: string;
  evidence: {
    metricName: string;
    currentValue: string | number;
    previousValue?: string | number;
    changePercent?: number;
  };
}

export interface AIProviderResponse {
  text: string;
  structuredData?: any;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface IAIProvider {
  name: string;
  generateText(prompt: string, systemPrompt?: string): Promise<AIProviderResponse>;
  generateStructuredOutput<T>(prompt: string, schemaDescription: string, systemPrompt?: string): Promise<T>;
  classifyComplaint(subject: string, description: string): Promise<AIComplaintClassificationResult>;
}
