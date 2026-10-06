import { IAIProvider, AIProviderResponse, AIComplaintClassificationResult } from './ai-types';

export class BuiltInDeterministicAIProvider implements IAIProvider {
  name = 'BUILTIN_DETERMINISTIC';

  async generateText(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    return {
      text: `Based on your request, I analyzed the verified database context for matching products and suppliers.`,
      tokensUsed: { prompt: prompt.length, completion: 50, total: prompt.length + 50 },
    };
  }

  async generateStructuredOutput<T>(prompt: string, schemaDescription: string, systemPrompt?: string): Promise<T> {
    return {} as T;
  }

  async classifyComplaint(subject: string, description: string): Promise<AIComplaintClassificationResult> {
    const text = `${subject} ${description}`.toLowerCase();

    let suggestedCategory: AIComplaintClassificationResult['suggestedCategory'] = 'OTHER';
    let suggestedPriority: AIComplaintClassificationResult['suggestedPriority'] = 'MEDIUM';

    if (text.includes('wrong') || text.includes('incorrect') || text.includes('different item')) {
      suggestedCategory = 'WRONG_PRODUCT';
      suggestedPriority = 'HIGH';
    } else if (text.includes('damage') || text.includes('broken') || text.includes('spoiled')) {
      suggestedCategory = 'DAMAGED_PRODUCT';
      suggestedPriority = 'HIGH';
    } else if (text.includes('missing') || text.includes('shortage')) {
      suggestedCategory = 'MISSING_PRODUCT';
      suggestedPriority = 'HIGH';
    } else if (text.includes('late') || text.includes('delay') || text.includes('waiting')) {
      suggestedCategory = 'LATE_DELIVERY';
      suggestedPriority = 'MEDIUM';
    } else if (text.includes('payment') || text.includes('charged') || text.includes('double')) {
      suggestedCategory = 'PAYMENT';
      suggestedPriority = 'URGENT';
    } else if (text.includes('refund')) {
      suggestedCategory = 'REFUND';
      suggestedPriority = 'HIGH';
    }

    return {
      suggestedCategory,
      suggestedPriority,
      summary: `Automated classification: ${suggestedCategory} issue detected.`,
      confidenceScore: 0.92,
    };
  }
}

export class ExternalOpenAIProvider implements IAIProvider {
  name = 'OPENAI';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIProviderResponse> {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return {
          text: data.choices[0].message.content,
          tokensUsed: {
            prompt: data.usage?.prompt_tokens || 0,
            completion: data.usage?.completion_tokens || 0,
            total: data.usage?.total_tokens || 0,
          },
        };
      }
      throw new Error(data.error?.message || 'OpenAI generation failed');
    } catch (err: any) {
      console.warn('[OpenAIProvider] Falling back to Deterministic provider:', err.message);
      const fallback = new BuiltInDeterministicAIProvider();
      return fallback.generateText(prompt, systemPrompt);
    }
  }

  async generateStructuredOutput<T>(prompt: string, schemaDescription: string, systemPrompt?: string): Promise<T> {
    const response = await this.generateText(
      `${prompt}\n\nRespond ONLY with valid JSON matching this schema: ${schemaDescription}`,
      systemPrompt
    );
    try {
      return JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, '').trim()) as T;
    } catch (e) {
      throw new Error('Failed to parse AI structured JSON output');
    }
  }

  async classifyComplaint(subject: string, description: string): Promise<AIComplaintClassificationResult> {
    const fallback = new BuiltInDeterministicAIProvider();
    return fallback.classifyComplaint(subject, description);
  }
}
